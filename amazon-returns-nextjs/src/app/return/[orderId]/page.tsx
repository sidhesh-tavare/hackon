"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ordersDb from "../../../data/orders-db.json";
import productsDb from "../../../data/products.json";
import toast from "react-hot-toast";

export default function ReturnPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const order = (ordersDb.orders as any)[orderId];

  const [reason, setReason] = useState("");
  const [subReason, setSubReason] = useState("");
  const [comments, setComments] = useState("");
  
  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Popup State
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const router = useRouter();

  if (!order) return <div className="p-8 text-center">Order not found</div>;
  
  const product = (productsDb.catalog as any)[order.asin];
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const endDate = new Date(order.timeline.return_window_ends_at);
  const eligibleDateStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const categoryReasons: Record<string, string[]> = {
    "default": [
      "Item is defective or does not work",
      "Damaged or used product",
      "Missing parts or accessories",
      "Wrong item was sent",
      "No longer needed"
    ]
  };

  const subReasonsMap: Record<string, string[]> = {
    "Item is defective or does not work": [
      "Device won't power on",
      "Makes unusual noise",
      "Item defective"
    ],
    "Damaged or used product": [
      "Used product received",
      "Product damaged, but shipping box OK",
      "Both product and shipping box damaged"
    ],
    "Missing parts or accessories": [
      "Entire Item Missing",
      "Missing Quantity",
      "Parts / Accessory Missing"
    ],
    "Wrong item was sent": [
      "Inaccurate website description",
      "Wrong style received - size/color",
      "Wrong brand received",
      "Product entirely different"
    ],
    "No longer needed": [
      "Bought by mistake",
      "Better price available",
      "Changed my mind"
    ]
  };

  const currentReasons = categoryReasons["default"];
  const currentSubReasons = subReasonsMap[reason] || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;
    
    // Append files instead of replacing
    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Create preview URLs
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        setUploadProgress(100);
        clearInterval(interval);
        setTimeout(() => setIsUploading(false), 200);
      } else {
        setUploadProgress(progress);
      }
    }, 150);
  };

  const handleContinue = async () => {
    if (!reason || !subReason || selectedFiles.length === 0) {
      toast.error("Please fill all required fields and upload images.");
      return;
    }
    
    setIsPopupOpen(true);
    setIsGrading(true);
    setAiResponse(null);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("product_name", product.title);
      formData.append("category", product.category);
      formData.append("sub_category", product.sub_category);
      formData.append("expected_color", product.attributes?.color || "Unknown");
      formData.append("reason", reason);
      formData.append("sub_reason", subReason);
      formData.append("price", order.purchase_price_inr.toString());
      if (comments) formData.append("customer_notes", comments);
      
      const res = await fetch("http://localhost:8000/api/grade", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error("Failed to reach Rufus AI server");
      }
      
      const data = await res.json();
      
      if (data.error) {
         throw new Error(data.error);
      }
      
      setAiResponse(data);
      
    } catch (err: any) {
      toast.error(err.message || "An error occurred during evaluation.");
      setIsPopupOpen(false); // Close popup on error
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen pt-4 pb-20 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column */}
        <div className="flex-grow">
          <div className="bg-white rounded shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-8 text-black">Choose items to return</h1>
            
            <div className="flex items-start gap-4">
              <input type="checkbox" defaultChecked className="mt-2 w-4 h-4 cursor-pointer accent-[#007185]" />
              
              <div className="w-16 h-20 md:w-20 md:h-24 bg-gray-100 border border-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain p-1" />
              </div>
              
              <div className="flex-grow flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <h3 className="font-bold text-sm text-black">{product.title}</h3>
                  <div className="text-sm mt-1 text-[#0f1111]">₹{order.purchase_price_inr.toLocaleString()}</div>
                  <div className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer text-xs mt-2 font-bold">Details ▼</div>
                </div>

                <div className="w-full md:w-72 flex-shrink-0 flex flex-col gap-4">
                  
                  {/* Primary Reason */}
                  <div>
                    <label className="block text-sm mb-1 text-[#0f1111]">What is the issue with the item? (required)</label>
                    <select 
                      className="w-full bg-[#f0f2f2] border border-[#d5d9d9] rounded-md px-3 py-1.5 shadow-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-sm cursor-pointer"
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        setSubReason("");
                      }}
                    >
                      <option value="" disabled>Choose a response</option>
                      {currentReasons.map((r, i) => (
                        <option key={i} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Reason Dropdown */}
                  {reason && currentSubReasons.length > 0 && (
                    <div className="animate-fade-in">
                      <label className="block text-sm mb-1 text-[#0f1111]">Please tell us more</label>
                      <select 
                        className="w-full bg-[#f0f2f2] border border-[#d5d9d9] rounded-md px-3 py-1.5 shadow-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-sm cursor-pointer"
                        value={subReason}
                        onChange={(e) => setSubReason(e.target.value)}
                      >
                        <option value="" disabled>Choose a response</option>
                        {currentSubReasons.map((r, i) => (
                          <option key={i} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Image Upload Area */}
                  {subReason && (
                    <div className="animate-fade-in mt-2">
                      <h4 className="font-bold text-sm text-black mb-1">Add photos of the item</h4>
                      <p className="text-xs text-gray-600 mb-3">
                        Capture photos of each item separately with visible defects. Wait for photos to upload. <span className="text-[#007185] hover:underline cursor-pointer">See guidelines</span>
                      </p>
                      
                      <div className="flex gap-4 items-center">
                        <label className="w-20 h-20 rounded-full border-2 border-dashed border-[#d5d9d9] flex items-center justify-center cursor-pointer hover:bg-gray-50 flex-shrink-0 relative bg-white">
                          <span className="text-2xl text-[#d5d9d9] font-bold absolute">📷<span className="absolute -bottom-1 -right-1 text-sm bg-white rounded-full">➕</span></span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileSelect}
                          />
                        </label>
                        
                        {/* Previews */}
                        {previewUrls.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto flex-grow h-20 items-center">
                            {previewUrls.map((url, i) => (
                              <div key={i} className="w-16 h-16 border border-gray-300 rounded overflow-hidden flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="Upload" className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {isUploading && (
                              <div className="text-xs text-gray-500 font-bold ml-2">{uploadProgress}%</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comments Box */}
                  {subReason && previewUrls.length > 0 && (
                    <div className="animate-fade-in mt-2">
                      <label className="block text-sm text-black mb-1">Comments (optional):</label>
                      <textarea
                        className="w-full border border-gray-400 rounded px-2 py-1 shadow-sm outline-none focus:border-[#e77600] text-sm resize-none"
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Please provide details..."
                      />
                      <div className="text-xs text-gray-500 mt-1">200 characters remaining.</div>
                      
                      <div className="text-xs text-gray-600 mt-4 leading-tight">
                        <strong>NOTE:</strong> We aren't able to offer policy exceptions in response to comments. Do not include personal information as these comments may be shared with external service providers to identify product defects.
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-6 border border-[#d5d9d9]">
            <button 
              className={`amz-btn-primary rounded-lg py-2 font-medium mb-2 shadow-md w-full ${(!reason || !subReason || selectedFiles.length === 0) ? 'opacity-50 cursor-not-allowed hover:bg-[#ffd814]' : ''}`}
              disabled={!reason || !subReason || selectedFiles.length === 0}
              onClick={handleContinue}
            >
              Continue
            </button>
            <div className="text-center text-[13px] text-[#0f1111] mb-4">
              Return eligible till <span className="font-bold">{eligibleDateStr}</span>
            </div>
            
            <hr className="border-[#d5d9d9] mb-4" />
            
            <h3 className="font-bold text-[13px] mb-4 text-[#0f1111]">Items you are returning</h3>
            <div className="w-16 h-20 border border-gray-200 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain p-1" />
            </div>
          </div>
        </div>
      </div>

      {/* RUFUS AI EVALUATION MODAL */}
      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in relative border border-gray-300">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#f0f2f2] to-white border-b border-[#d5d9d9] p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Image src="/images/rufus.jpeg" alt="Rufus" width={32} height={32} className="rounded-full shadow-sm border border-gray-300" />
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-lg text-black tracking-tight">Rufus</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI Evaluation</div>
                </div>
              </div>
              {!isGrading && (
                <button className="text-xl text-gray-400 hover:text-black transition-colors" onClick={() => setIsPopupOpen(false)}>✕</button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow bg-white">
              {isGrading ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center relative z-10 overflow-hidden bg-white">
                       <Image src="/images/rufus.jpeg" alt="Rufus" width={80} height={80} className="object-cover" />
                    </div>
                    {/* Spinning ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#007185] animate-spin z-20"></div>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">Rufus is analyzing your return</h3>
                  <p className="text-[#565959] max-w-sm">Comparing your photos against our catalog to determine eligible return options...</p>
                </div>
              ) : aiResponse ? (
                /* Results State */
                <div className="animate-fade-in">
                  
                  {/* ITEM MISMATCH */}
                  {aiResponse.routing?.action === "ITEM_MISMATCH" && (
                    <div className="border border-[#d0021b] rounded-lg p-5">
                      <div className="flex gap-3 mb-4">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <h3 className="text-[#d0021b] font-bold text-lg">Product Mismatch Detected</h3>
                          <p className="text-sm text-black mt-1">Rufus noticed the uploaded images do not match <strong>{product.title}</strong>.</p>
                        </div>
                      </div>
                      <button 
                        className="w-full bg-white border border-[#d5d9d9] text-black py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                        onClick={() => setIsPopupOpen(false)}
                      >
                        Retake / Re-upload Photos
                      </button>
                    </div>
                  )}

                  {/* STANDARD RETURN */}
                  {aiResponse.routing?.action === "STANDARD_RETURN" && (
                    <div className="border border-[#84c225] rounded-lg p-5 bg-[#fafff0]">
                      <div className="flex gap-3 mb-4">
                        <span className="text-2xl">✅</span>
                        <div>
                          <h3 className="text-black font-bold text-lg">Return Approved</h3>
                          <p className="text-sm text-black mt-1">Your item is fully eligible for a standard return and full refund.</p>
                        </div>
                      </div>
                      <button 
                        className="w-full bg-[#ffd814] border border-[#fcd200] text-black py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#f7ca00] transition-colors"
                        onClick={() => {
                          toast.success("Return Shipping Label Generated!");
                          router.push("/");
                        }}
                      >
                        Generate Return Label
                      </button>
                    </div>
                  )}

                  {/* INSTANT CASHBACK */}
                  {aiResponse.routing?.action === "INSTANT_CASHBACK" && (
                    <div className="border border-[#c45500] rounded-lg p-6 bg-white shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                         <span className="text-8xl">💰</span>
                      </div>

                      <h3 className="text-black font-bold text-xl mb-2">Keep it & Get Paid!</h3>
                      <p className="text-[13px] text-black mb-4 pr-12 leading-relaxed">
                        Rufus detected minor cosmetic wear. Since the item is structurally sound, instead of shipping it back, you can keep it and we'll instantly credit your Amazon Pay Wallet.
                      </p>

                      {/* Display Defects found */}
                      {aiResponse.analysis?.cosmetic_inspection?.issues?.length > 0 && (
                        <div className="bg-[#f0f2f2] rounded p-3 mb-5 border border-[#d5d9d9]">
                          <div className="text-[11px] font-bold text-[#565959] uppercase tracking-wider mb-2">Cosmetic Defects Identified:</div>
                          <ul className="text-[13px] text-black space-y-1 ml-4 list-disc marker:text-[#e77600]">
                            {aiResponse.analysis.cosmetic_inspection.issues.map((issue: any, i: number) => (
                              <li key={i}>{issue.description} <span className="text-gray-500">({issue.severity} severity)</span></li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-6 p-4 bg-[#fafff0] border border-[#84c225] rounded-lg">
                        <div className="flex-grow">
                          <div className="text-[11px] font-bold text-gray-500 uppercase">Instant Wallet Credit</div>
                          <div className="text-3xl font-black text-[#84c225]">
                            ₹{aiResponse.routing.cashback_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          className="w-full bg-[#ffd814] border border-[#fcd200] text-black py-3 rounded-full text-[15px] font-bold shadow-sm hover:bg-[#f7ca00] transition-colors"
                          onClick={() => {
                            toast.success(`₹${aiResponse.routing.cashback_amount} added to your Amazon Pay Wallet!`);
                            router.push("/");
                          }}
                        >
                          Accept Instant Cash
                        </button>
                        <div className="text-center mt-1">
                          <button 
                            className="text-[#007185] hover:text-[#c45500] hover:underline text-[13px] font-medium"
                            onClick={() => {
                              toast.success("Proceeding to Standard Return");
                              router.push("/");
                            }}
                          >
                            No thanks, proceed with standard return
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
