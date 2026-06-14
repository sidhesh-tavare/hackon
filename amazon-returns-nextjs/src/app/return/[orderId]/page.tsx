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

  // Steps: 1 = Details, 2 = AI Evaluation, 3 = Resolution
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [reason, setReason] = useState("");
  const [subReason, setSubReason] = useState("");
  const [comments, setComments] = useState("");
  
  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Grading State
  const [isGrading, setIsGrading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [resolutionChoice, setResolutionChoice] = useState<"cashback" | "return">("cashback");

  const router = useRouter();

  if (!order) return <div className="p-8 text-center">Order not found</div>;
  
  const product = (productsDb.catalog as any)[order.asin];
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const endDate = new Date(order.timeline.return_window_ends_at);
  const eligibleDateStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const categoryReasons: Record<string, string[]> = {
    "Apparel": [
      "Size is too small/large",
      "Fit is not as expected",
      "Color/style does not match description",
      "Fabric is defective or torn",
      "Item arrived stained or damaged"
    ],
    "Electronics": [
      "Item is defective or does not work",
      "Device won't power on",
      "Screen or physical damage on arrival",
      "Cosmetic damage but works fine",
      "Missing charger or accessories",
      "Wrong item was sent"
    ],
    "Appliances": [
      "Appliance is defective or does not work",
      "Item and outer packaging damaged",
      "Cosmetic damage but works fine",
      "Missing parts or accessories",
      "Makes unusual noise during operation",
      "Wrong item was sent"
    ],
    "Accessories": [
      "Missing parts or accessories",
      "Item is broken or damaged",
      "Does not fit my device",
      "Wrong item was sent",
      "No longer needed"
    ],
    "Consumables": [
      "Product is expired",
      "Seal was broken on arrival",
      "Taste or consistency is wrong",
      "Wrong item was sent",
      "Damaged during transit"
    ],
    "default": [
      "Item is defective or does not work",
      "Damaged or used product",
      "Missing parts or accessories",
      "Wrong item was sent",
      "No longer needed"
    ]
  };

  const subReasonsMap: Record<string, string[]> = {
    // Apparel
    "Size is too small/large": ["Too short", "Too long", "Too tight", "Too loose"],
    "Fit is not as expected": ["Unflattering fit", "Not suitable for my body type"],
    "Color/style does not match description": ["Color is different than website", "Pattern/design differs"],
    "Fabric is defective or torn": ["Hole in fabric", "Seam unraveling", "Zipper/Button broken"],
    "Item arrived stained or damaged": ["Noticeable stain", "Looks worn or used"],
    
    // Electronics & Appliances
    "Item is defective or does not work": ["Device won't power on", "Makes unusual noise", "Screen is unresponsive", "Battery won't hold charge"],
    "Device won't power on": ["No response when plugged in", "Battery totally dead"],
    "Screen or physical damage on arrival": ["Cracked screen", "Dented casing", "Scratches on display"],
    "Missing charger or accessories": ["Missing power cable", "Missing remote/accessories"],
    "Appliance is defective or does not work": ["Won't turn on", "Doesn't perform main function", "Trips circuit breaker"],
    "Makes unusual noise during operation": ["Loud grinding noise", "High pitched whine", "Rattling sounds"],
    
    // Generic
    "Damaged or used product": ["Damaged and does not work", "Damaged but works fine", "Used product received", "Both product and shipping box damaged"],
    "Missing parts or accessories": ["Entire Item Missing", "Missing Quantity", "Parts / Accessory Missing"],
    "Wrong item was sent": ["Inaccurate website description", "Wrong style received - size/color", "Wrong brand received", "Product entirely different"],
    "No longer needed": ["Bought by mistake", "Better price available", "Changed my mind"],
    "Item and outer packaging damaged": ["Box crushed", "Water damage to package"],
    "Item is broken or damaged": ["Snapped in half", "Cracked exterior", "Bent out of shape"],
    "Cosmetic damage but works fine": ["Scratches on casing", "Dented but functional", "Minor scuffs on edges"],
    "Does not fit my device": ["Connector is wrong type", "Case is too small/large"],
    "Product is expired": ["Past sell-by date", "Smells/looks spoiled"],
    "Seal was broken on arrival": ["Safety seal missing", "Lid was unscrewed"],
    "Taste or consistency is wrong": ["Tastes stale or off", "Clumpy/separated texture"],
    "Damaged during transit": ["Container leaked/spilled", "Smashed inside box"]
  };

  const currentReasons = categoryReasons[product.category] || categoryReasons["default"];
  const currentSubReasons = subReasonsMap[reason] || ["Other Issue"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;
    
    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);
    setIsUploading(true);
    setUploadProgress(0);
    
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

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

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setCurrentStep(1);
    setReason("");
    setSubReason("");
    setComments("");
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAiResponse(null);
    setResolutionChoice("cashback");
  };

  const handleContinue = async () => {
    if (!reason || !subReason || selectedFiles.length === 0) {
      toast.error("Please fill all required fields and upload images.");
      return;
    }
    
    setCurrentStep(2);
    setIsGrading(true);
    setAiResponse(null);
    
    // Scroll to top to see the new layout
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    
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
      setCurrentStep(3); // Resolution
      
    } catch (err: any) {
      toast.error(err.message || "An error occurred during evaluation.");
      setCurrentStep(1); // Revert on error
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen pt-4 pb-20" style={{ fontFamily: "'Amazon Ember', Arial, sans-serif" }}>
      

      {currentStep < 4 && (
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column */}
        <div className="flex-grow flex flex-col gap-6">
          
          {/* STEP 1: Details */}
          {currentStep === 1 && (
            <div className={`bg-white shadow-sm p-6`}>
              <div className="flex justify-between items-center mb-8">
                 <h1 className="text-2xl font-bold text-black">Choose items to return</h1>
              </div>
              
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
                                <div key={i} className="w-16 h-16 border border-gray-300 rounded overflow-hidden flex-shrink-0 bg-white relative cursor-zoom-in hover:opacity-80 transition-opacity">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={url} alt="Upload" className="w-full h-full object-cover" onClick={() => setZoomedImage(url)} />
                                  <button 
                                    className="absolute top-0 right-0 bg-white/80 text-black w-4 h-4 flex items-center justify-center rounded-bl font-bold text-[10px] hover:bg-white"
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                  >
                                    ✕
                                  </button>
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
                    {subReason && (
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
          )}

          {/* STEP 3: Resolution UI (Matches screenshot) */}
          {currentStep >= 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Top Summary Bar */}
              <div className="bg-white p-4 flex flex-col md:flex-row gap-4 md:gap-8 border border-[#d5d9d9] shadow-sm">
                 <div>
                   <div className="font-bold text-[#0f1111] text-[15px]">What is the issue with the item?</div>
                   <div className="text-[14px] text-[#0f1111]">{reason} - {subReason}</div>
                 </div>
                 {comments && (
                   <div className="md:border-l md:border-[#d5d9d9] md:pl-8">
                     <div className="font-bold text-[#0f1111] text-[15px]">Customer Comments:</div>
                     <div className="text-[14px] text-gray-700 italic">"{comments}"</div>
                   </div>
                 )}
              </div>

              {/* Main How Can We Make It Right Section */}
              <div className="bg-white p-6 shadow-sm border border-[#d5d9d9]">
                 <h2 className="font-bold text-[#0f1111] text-[18px] mb-6">How can we make it right?</h2>
                 
                 <div className="flex gap-8">
                   {/* Left: Product Image */}
                   <div className="flex flex-col items-center w-24 flex-shrink-0">
                     <div className="w-16 h-20 flex items-center justify-center">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={product.primary_image_url} alt={product.title} className="max-w-full max-h-full object-contain" />
                     </div>
                     <div className="text-[#007185] text-[13px] mt-2 cursor-pointer hover:text-[#c45500] hover:underline">Details ˅</div>
                   </div>

                   {/* Right: Resolution Body */}
                   <div className="flex-grow">
                      {/* Rufus Evaluation Block */}
                      <div className="bg-gradient-to-br from-[#e6f4fa] to-[#f3f9fb] border border-[#d5d9d9] rounded overflow-hidden">
                         <div className="bg-white/60 border-b border-[#d5d9d9] p-3 flex justify-between items-center backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                              <Image src="/images/rufus.jpeg" alt="Rufus" width={24} height={24} className="rounded-full shadow-sm border border-gray-300" />
                              <div className="flex items-baseline gap-1">
                                <span className="font-bold text-[15px] text-[#0f1111] tracking-tight">Rufus</span>
                                <span className="text-[10px] text-[#007185] font-bold uppercase tracking-wider">AI Evaluation</span>
                              </div>
                            </div>
                            <button onClick={handleReset} className="text-[12px] text-gray-500 hover:text-[#0f1111] hover:underline bg-white px-2 py-1 rounded shadow-sm border border-[#d5d9d9]">Reset Evaluation</button>
                         </div>
                         
                         <div className="p-5">
                            {isGrading ? (
                              <div className="flex flex-col items-center justify-center py-4 text-center animate-pulse">
                                <div className="text-[14px] font-bold text-[#0f1111] mb-1">Rufus is analyzing your return...</div>
                                <p className="text-gray-500 text-[12px]">Comparing your photos against our catalog to determine eligible return options.</p>
                              </div>
                            ) : aiResponse ? (
                               <div className="animate-fade-in">
                                  {aiResponse.routing?.action === "ITEM_MISMATCH" && (
                                     <div>
                                        <div className="font-bold text-[#d0021b] text-[15px] mb-1">⚠️ Product Mismatch Detected</div>
                                        <p className="text-[13px] text-gray-800">Rufus noticed the uploaded images do not match <strong>{product.title}</strong>. Please retake the photos using the buttons on the right.</p>
                                     </div>
                                  )}
                                  
                                  {aiResponse.routing?.action === "STANDARD_RETURN" && (
                                     <div>
                                        <div className="font-bold text-[#0f1111] text-[15px] mb-1">Standard Return Approved</div>
                                        <p className="text-[13px] text-[#0f1111] mb-4">We'll process a standard return and full refund.</p>
                                        
                                        {aiResponse.analysis?.reasoning && (
                                          <div className="bg-[#f0f2f2] rounded p-3 mb-4 border border-[#d5d9d9]">
                                            <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider mb-1">Rufus Evaluation Notes:</div>
                                            <p className="text-[12px] text-gray-800 italic">"{aiResponse.analysis.reasoning}"</p>
                                          </div>
                                        )}

                                        <div className="flex items-start gap-2 mt-4">
                                           <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 accent-[#007185] cursor-pointer" />
                                           <div className="text-[13px] text-[#0f1111]">
                                              <div className="font-bold mb-1">I agree to return all items with below:</div>
                                              <ul className="list-disc ml-5 mt-1 text-gray-600">
                                                <li>Original condition with price tags, accessories (including warranty cards etc.)</li>
                                                <li>Item properly uninstalled/ disassembled</li>
                                              </ul>
                                              <div className="mt-3 text-[#565959]">This helps us avoid refund delays or failed pickups.</div>
                                           </div>
                                        </div>
                                     </div>
                                  )}

                                  {aiResponse.routing?.action === "INSTANT_CASHBACK" && (
                                     <div>
                                        <div className="font-bold text-[#c45500] text-[16px] mb-1">Keep it & Get Paid!</div>
                                        <p className="text-[13px] text-[#0f1111] mb-4">Rufus detected minor cosmetic wear. Since the item is structurally sound, instead of shipping it back, you can keep it and we'll instantly credit your Amazon Pay Wallet.</p>
                                        
                                        {aiResponse.routing?.justification && (
                                          <div className="bg-[#f0f2f2] rounded p-3 mb-4 border border-[#d5d9d9]">
                                            <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider mb-1">Rufus Evaluation Notes:</div>
                                            <p className="text-[12px] text-gray-800 italic">"{aiResponse.routing.justification}"</p>
                                          </div>
                                        )}

                                        {aiResponse.analysis?.cosmetic_inspection?.issues?.length > 0 && (
                                          <div className="bg-white rounded p-3 border border-[#d5d9d9] mb-4">
                                            <div className="text-[10px] font-bold text-[#565959] uppercase tracking-wider mb-1">Cosmetic Defects Identified:</div>
                                            <ul className="text-[12px] text-[#0f1111] list-disc ml-4 marker:text-[#e77600]">
                                              {aiResponse.analysis.cosmetic_inspection.issues.map((i: any, idx: number) => (
                                                <li key={idx}>{i.description}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {/* Selectable Option Panels */}
                                        <div className="flex flex-col gap-3 mt-5">
                                          
                                          {/* Option 1: Instant Cashback */}
                                          <div 
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${resolutionChoice === 'cashback' ? 'bg-[#fef8f2] border-[#e77600]' : 'bg-white border-[#d5d9d9] hover:bg-gray-50'}`}
                                            onClick={() => setResolutionChoice("cashback")}
                                          >
                                            <div className="flex items-start gap-3">
                                              <input type="radio" checked={resolutionChoice === 'cashback'} readOnly className="mt-1 w-4 h-4 accent-[#e77600] cursor-pointer" />
                                              <div>
                                                <div className="font-bold text-[14px] text-[#0f1111]">Instant Wallet Credit</div>
                                                <div className="text-[13px] text-gray-800 mt-1">Keep the item and get paid instantly to your Amazon Pay Wallet.</div>
                                                <div className="text-2xl font-black text-[#B12704] mt-2">₹{aiResponse.routing.cashback_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                                                {aiResponse.routing?.calculation && (
                                                  <div className="text-[11px] text-[#565959] mt-1 bg-white p-2 rounded border border-dashed border-gray-300">
                                                    <strong>Calculation formula:</strong> ₹{aiResponse.routing.calculation.item_price.toLocaleString()} (Item Price) × {(aiResponse.routing.calculation.multiplier_applied * 100).toFixed(0)}% (Severity Deduction) = ₹{aiResponse.routing.cashback_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Option 2: Standard Return */}
                                          <div 
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${resolutionChoice === 'return' ? 'bg-[#fef8f2] border-[#e77600]' : 'bg-white border-[#d5d9d9] hover:bg-gray-50'}`}
                                            onClick={() => setResolutionChoice("return")}
                                          >
                                            <div className="flex items-start gap-3">
                                              <input type="radio" checked={resolutionChoice === 'return'} readOnly className="mt-1 w-4 h-4 accent-[#e77600] cursor-pointer" />
                                              <div className="flex-grow">
                                                <div className="font-bold text-[14px] text-[#0f1111]">Standard Return</div>
                                                <div className="text-[13px] text-gray-800 mt-1">Return the item for a full refund.</div>
                                                
                                                {/* Checklist */}
                                                {resolutionChoice === 'return' && (
                                                  <div className="mt-3 bg-white p-3 rounded border border-[#d5d9d9] animate-fade-in">
                                                     <div className="font-bold text-[12px] text-[#0f1111] mb-1">I agree to return all items with below:</div>
                                                     <ul className="list-disc ml-4 text-[12px] text-gray-600">
                                                       <li>Original condition with price tags, accessories</li>
                                                       <li>Item properly uninstalled/ disassembled</li>
                                                     </ul>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                        </div>

                                        {/* Raw JSON Details */}
                                        <div className="mt-8 pt-4 border-t border-[#d5d9d9]">
                                           <details className="text-[12px] text-gray-500">
                                             <summary className="cursor-pointer font-bold text-[#007185] hover:text-[#c45500] hover:underline">View Raw AI Telemetry (JSON)</summary>
                                             <pre className="mt-3 p-3 bg-[#111827] text-[#a78bfa] rounded overflow-x-auto whitespace-pre-wrap text-[11px] border border-gray-800">
                                               {JSON.stringify(aiResponse, null, 2)}
                                             </pre>
                                           </details>
                                        </div>
                                     </div>
                                  )}
                               </div>
                            ) : null}
                         </div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar Action Buttons) */}
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="bg-white shadow-sm p-5 border border-[#d5d9d9]">
            
            {/* Step 1 Actions */}
            {currentStep === 1 && (
              <button 
                className={`w-full bg-[#ffd814] border border-[#fcd200] text-[#0f1111] rounded-full py-[6px] text-[13px] shadow-sm mb-4 ${(!reason || !subReason || selectedFiles.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f7ca00]'}`}
                disabled={!reason || !subReason || selectedFiles.length === 0}
                onClick={handleContinue}
              >
                Continue
              </button>
            )}

            {/* Step 3 Actions */}
            {currentStep >= 2 && aiResponse && (
              <div className="mb-4">
                {aiResponse.routing?.action === "ITEM_MISMATCH" && (
                  <button 
                    className="w-full bg-white border border-[#d5d9d9] text-[#0f1111] py-[6px] rounded-full text-[13px] shadow-sm hover:bg-gray-50 transition-colors"
                    onClick={handleReset}
                  >
                    Retake Photos
                  </button>
                )}
                {aiResponse.routing?.action === "STANDARD_RETURN" && (
                  <button 
                    className="w-full bg-[#ffd814] border border-[#fcd200] text-[#0f1111] py-[6px] rounded-full text-[13px] shadow-sm hover:bg-[#f7ca00] transition-colors"
                    onClick={() => {
                      setCurrentStep(4);
                    }}
                  >
                    Continue
                  </button>
                )}
                {aiResponse.routing?.action === "INSTANT_CASHBACK" && (
                  <button 
                    className="w-full bg-[#ffd814] border border-[#fcd200] text-[#0f1111] py-[6px] rounded-full text-[13px] shadow-sm hover:bg-[#f7ca00] transition-colors"
                    onClick={() => {
                      setCurrentStep(4);
                    }}
                  >
                    Continue
                  </button>
                )}
              </div>
            )}
            
            {/* Sidebar Details */}
            {currentStep === 1 && (
               <div className="text-center text-[12px] text-[#0f1111] mb-4">
                 Return eligible till <span className="font-bold">{eligibleDateStr}</span>
               </div>
            )}
            
            <hr className="border-[#d5d9d9] mb-4" />
            
            <h3 className="font-bold text-[13px] mb-3 text-[#0f1111]">Items you are returning</h3>
            <div className="w-12 h-16 border border-gray-200 bg-white flex items-center justify-center overflow-hidden mb-2">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain p-1" />
            </div>
          </div>
        </div>
      </div>
      )}
      
      {currentStep >= 4 && (
        <div className="max-w-[800px] mx-auto px-4 mt-8">
          <div className="bg-white shadow-sm p-10 text-center border border-[#d5d9d9] animate-fade-in">
            {resolutionChoice === 'cashback' ? (
              <>
                <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-[#e77600] mb-4">Return Applied!</h2>
                <p className="text-[#0f1111] mb-6 text-lg">
                  <strong className="text-xl">₹{aiResponse?.routing?.cashback_amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> has been instantly credited to your Amazon Pay Balance.
                </p>
                <p className="text-[14px] text-gray-600 mb-8 max-w-md mx-auto">You may keep the item. There is no need to ship it back to us.</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-[#dcfce7] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-[#0f1111] mb-4">Return Accepted!</h2>
                <p className="text-[#0f1111] mb-6 text-lg">
                  Your return request has been processed. A full refund of <strong className="text-xl">₹{order.purchase_price_inr.toLocaleString()}</strong> will be issued once the item is received and inspected.
                </p>
                <p className="text-[14px] text-gray-600 mb-8 max-w-md mx-auto">Please print your return shipping label and drop the package at your nearest location.</p>
              </>
            )}
            <button 
              onClick={() => router.push("/")} 
              className="bg-[#ffd814] border border-[#fcd200] text-[#0f1111] py-3 px-12 rounded-full text-[15px] font-bold shadow-sm hover:bg-[#f7ca00] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[150] p-4 backdrop-blur-md" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }} 
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomedImage} alt="Zoomed Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
            <button 
              className="absolute -top-4 -right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setZoomedImage(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
