"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import ordersDb from "../../../data/orders-db.json";
import productsDb from "../../../data/products.json";
import toast from "react-hot-toast";

export default function ReturnPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const order = (ordersDb.orders as any)[orderId];

  const [reason, setReason] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  if (!order) return <div className="p-8 text-center">Order not found</div>;
  
  const product = (productsDb.catalog as any)[order.asin];
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const endDate = new Date(order.timeline.return_window_ends_at);
  const eligibleDateStr = endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    setIsUploading(true);
    setUploadProgress(0);
    setAiResponse(null);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
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

  const handleSubmitForGrading = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsGrading(true);
    const loadingToast = toast.loading("Rufus AI is inspecting your images...");
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));
      formData.append("product_name", product.title);
      formData.append("category", product.category);
      formData.append("sub_category", product.sub_category);
      formData.append("expected_color", product.attributes?.color || "Unknown");
      formData.append("reason", reason);
      if (customerNotes) formData.append("customer_notes", customerNotes);
      
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
      toast.success("AI Inspection Complete!", { id: loadingToast });
      
    } catch (err: any) {
      toast.error(err.message || "An error occurred during inspection.", { id: loadingToast });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="bg-[#eaeded] min-h-screen pt-4 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column */}
        <div className="flex-grow">
          <div className="bg-white rounded shadow-sm p-6">
            <h1 className="text-2xl font-normal mb-8 text-black">Choose items to return</h1>
            
            <div className="flex items-start gap-4">
              <input type="checkbox" defaultChecked className="mt-2 w-4 h-4 cursor-pointer accent-[#007185]" />
              
              <div className="w-20 h-24 bg-gray-100 border border-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain p-1" />
              </div>
              
              <div className="flex-grow flex flex-col md:flex-row justify-between gap-6">
                <div>
                  <h3 className="font-bold text-base text-black">{product.title}</h3>
                  <div className="text-sm mt-1 text-[#0f1111]">₹{order.purchase_price_inr.toLocaleString()}</div>
                  <div className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer text-xs mt-2 font-bold">Details ▼</div>
                </div>

                <div className="w-full md:w-64 flex-shrink-0">
                  <label className="block text-sm font-bold mb-2 text-[#0f1111]">What is the issue with the item? (required)</label>
                  <select 
                    className="w-full bg-[#f0f2f2] border border-[#d5d9d9] rounded-md px-3 py-2 shadow-sm outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] text-sm cursor-pointer"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="" disabled>Choose a response</option>
                    <option value="Item is defective or does not work">Item is defective or does not work</option>
                    <option value="Damaged or used product">Damaged or used product</option>
                    <option value="Missing parts or accessories">Missing parts or accessories</option>
                    <option value="Wrong item was sent">Wrong item was sent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-6">
            <button 
              className={`amz-btn-primary rounded-full py-2 font-medium mb-2 ${!reason ? 'opacity-60 cursor-not-allowed hover:bg-[#ffd814]' : ''}`}
              disabled={!reason}
              onClick={() => setShowUploadModal(true)}
            >
              Continue
            </button>
            <div className="text-center text-xs text-[#565959] mb-6">
              Return eligible till {eligibleDateStr}
            </div>
            
            <hr className="border-[#d5d9d9] mb-4" />
            
            <h3 className="font-bold text-sm mb-4 text-[#0f1111]">Items you are returning</h3>
            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-xl">
              📦
            </div>
          </div>
        </div>

      </div>

      {/* Rufus Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden flex flex-col h-[700px] max-h-[90vh]">
            
            {/* Rufus Header */}
            <div className="flex items-center justify-between border-b border-[#e6e6e6] p-4 pb-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-xl leading-none text-black">Rufus</span>
                  <span className="text-xl font-medium leading-none text-black">ai</span>
                </div>
                <div className="text-[11px] text-gray-500 leading-none mt-1">beta</div>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <button className="text-xl hover:text-black font-bold">⋮</button>
                <button className="text-2xl hover:text-black leading-none" onClick={() => setShowUploadModal(false)}>✕</button>
              </div>
            </div>
            
            {/* Rufus Chat Body */}
            <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-4 text-[14px] bg-white">
              
              {/* User Prompt Simulation */}
              <div className="self-end bg-[#eef1f4] rounded-2xl px-4 py-2 max-w-[85%] text-black">
                I want to return this item because: {reason}
              </div>

              {/* Rufus Response */}
              <div className="text-[#0f1111] leading-relaxed">
                <p className="mb-2">
                  I can help you with your return for the <strong>{product.title}</strong>.
                </p>
                <div className="mb-2">
                  <strong>Product Details:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Category:</strong> {product.category}</li>
                    <li><strong>Sub Category:</strong> {product.sub_category}</li>
                    {Object.entries(product.attributes || {}).map(([key, val]) => (
                      <li key={key} className="capitalize"><strong>{key.replace('_', ' ')}:</strong> {val as string}</li>
                    ))}
                  </ul>
                </div>
                <p className="mb-2">
                  Since the issue is "<strong>{reason}</strong>", I'll need to verify its condition before we proceed.
                </p>
                <p>
                  <strong>Next Step:</strong>
                  <br/>
                  • Please upload up to 5 clear photos of the item and its packaging.
                </p>
              </div>

              {/* Image Preview Area */}
              {isUploading ? (
                <div className="w-full mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div className="bg-[#007185] h-2 rounded-full transition-all duration-150 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">{uploadProgress}% Uploading...</div>
                </div>
              ) : previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="w-16 h-16 border border-gray-300 rounded overflow-hidden relative shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Notes */}
              <div className="flex flex-col mt-2 w-full max-w-[85%] self-start">
                <textarea
                  className="w-full bg-[#f0f2f2] border border-[#d5d9d9] rounded-md px-3 py-2 shadow-sm outline-none focus:border-[#e77600] text-sm text-black resize-none"
                  placeholder="Any additional notes about the product condition? (Optional)"
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  disabled={isUploading || isGrading || !!aiResponse}
                />
              </div>

              {/* Action Pills */}
              <div className="flex flex-col gap-2 mt-2 items-start">
                <label className="bg-[#e7f4fa] text-[#007185] px-4 py-2 rounded-full cursor-pointer hover:bg-[#d4edf8] transition-colors font-medium">
                  Select Images (Max 5)
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                </label>
                
                {!isUploading && !isGrading && !aiResponse && selectedFiles.length > 0 && (
                  <button 
                    className="bg-[#e7f4fa] text-[#007185] px-4 py-2 rounded-full cursor-pointer hover:bg-[#d4edf8] transition-colors font-medium"
                    onClick={handleSubmitForGrading}
                  >
                    Submit for AI Grading
                  </button>
                )}
              </div>

              {/* Grading Loading State */}
              {isGrading && (
                <div className="self-start bg-[#fff9ed] border border-[#febd69] rounded-2xl px-4 py-3 max-w-[85%] text-black flex items-center gap-3 mt-2">
                  <div className="animate-spin h-5 w-5 border-2 border-[#c45500] border-t-transparent rounded-full"></div>
                  <span>Rufus is scanning images...</span>
                </div>
              )}

              {/* Final AI Response */}
              {aiResponse && (
                <div className="self-start bg-[#f3f3f3] rounded-2xl px-4 py-3 max-w-[85%] text-black text-[13px] mt-2">
                  <p className="font-bold mb-2 text-[#007185]">AI Grading Results:</p>
                  <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap text-[11px] font-mono shadow-inner">
                    {JSON.stringify(aiResponse, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Rufus Footer Feedback */}
            <div className="p-4 flex gap-4 text-gray-400 border-t border-[#e6e6e6]">
              <button className="hover:text-gray-600 text-lg">👍</button>
              <button className="hover:text-gray-600 text-lg">👎</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
