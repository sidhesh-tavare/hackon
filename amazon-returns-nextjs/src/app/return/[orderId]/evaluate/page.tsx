"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import ordersDb from "../../../../data/orders-db.json";
import productsDb from "../../../../data/products.json";
import toast from "react-hot-toast";

export default function EvaluatePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = params.orderId as string;
  const reason = searchParams.get("reason") || "Not specified";
  
  const order = (ordersDb.orders as any)[orderId];
  const product = order ? (productsDb.catalog as any)[order.asin] : null;

  const [customerNotes, setCustomerNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  if (!order || !product) return <div className="p-8 text-center">Order or Product not found</div>;

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
    const loadingToast = toast.loading("Rufus AI is inspecting your items...");
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("product_name", product.title);
      formData.append("category", product.category);
      formData.append("sub_category", product.sub_category);
      formData.append("expected_color", product.attributes?.color || "Unknown");
      formData.append("reason", reason);
      formData.append("price", order.purchase_price_inr.toString());
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
    <div className="bg-[#eaeded] min-h-screen pt-8 pb-20">
      <div className="max-w-[800px] mx-auto px-4">
        
        {/* Rufus Header */}
        <div className="bg-white border-b border-[#e6e6e6] rounded-t-xl p-4 flex justify-between items-center">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl leading-none text-black">Rufus</span>
              <span className="text-xl font-medium leading-none text-black">ai</span>
            </div>
            <div className="text-[11px] text-gray-500 leading-none mt-1">beta</div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="text-xl hover:text-black font-bold">⋮</button>
            <button className="text-2xl hover:text-black leading-none" onClick={() => router.back()}>✕</button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-b-xl shadow-lg p-6 md:p-8">
          
          {/* Context Info */}
          <div className="flex gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 border border-gray-200 rounded p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.primary_image_url} alt="Product" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{product.title}</h2>
              <p className="text-sm text-gray-600 mt-1"><strong>Reason for return:</strong> {reason}</p>
            </div>
          </div>

          {!aiResponse ? (
            <div className="flex flex-col items-center">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Upload visual evidence</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Please upload up to 5 clear photos showing the current condition of the item. Rufus will evaluate it instantly.
                </p>
              </div>

              {/* Upload UI */}
              <div className="w-full max-w-lg mb-6">
                <label className="bg-[#e6f4fa] text-[#007185] hover:bg-[#d5edf8] rounded-[24px] p-5 flex flex-col items-center justify-center cursor-pointer transition-colors w-full shadow-sm text-center">
                  <span className="text-2xl mb-1 text-[#007185] opacity-90">📸</span>
                  <span className="font-medium text-[15px]">Select photos to upload</span>
                  <span className="text-xs text-[#007185] opacity-80 mt-1">Max 5 photos</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {/* Preview & Progress */}
              {isUploading ? (
                <div className="w-full max-w-lg mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-[#007185] h-2 rounded-full transition-all duration-150 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <div className="text-sm font-medium text-gray-500 text-center">{uploadProgress}% Uploading...</div>
                </div>
              ) : previewUrls.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {previewUrls.map((url, i) => (
                    <div 
                      key={i} 
                      className="w-20 h-20 border-2 border-white ring-2 ring-gray-200 rounded-lg overflow-hidden shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity"
                      onClick={() => setZoomedImage(url)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Notes */}
              <div className="w-full max-w-lg mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes (Optional)</label>
                <textarea
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 shadow-sm outline-none focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] text-gray-900 resize-none"
                  placeholder="Describe any specific defects, scratches, or issues you noticed..."
                  rows={3}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  disabled={isUploading || isGrading}
                />
              </div>

              {/* Submit Button */}
              {previewUrls.length > 0 && !isUploading && (
                <button 
                  className="w-full max-w-lg bg-[#ffd814] hover:bg-[#f7ca00] text-black py-4 rounded-xl font-bold shadow-sm transition-all text-lg flex justify-center items-center gap-2"
                  onClick={handleSubmitForGrading}
                  disabled={isGrading}
                >
                  {isGrading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-[#c45500] border-t-transparent rounded-full"></div>
                      Rufus is analyzing...
                    </>
                  ) : (
                    "Submit for Evaluation"
                  )}
                </button>
              )}
            </div>
          ) : (
            
            /* AI Results View */
            <div className="animate-fade-in">
              {/* ITEM_MISMATCH: PRODUCT MISMATCH */}
              {aiResponse.routing?.action === "ITEM_MISMATCH" && (
                <div className="bg-[#fff4f4] border-2 border-[#d0021b] rounded-xl p-6 md:p-8 shadow-sm mb-6">
                  <div className="flex items-center gap-3 text-[#d0021b] font-bold text-2xl mb-4">
                    <span className="text-3xl">⚠️</span> Product Mismatch Detected
                  </div>
                  <p className="text-gray-800 text-lg mb-6">
                    Rufus noticed that the uploaded images do not appear to match the item you purchased (<strong>{product.title}</strong>). Please verify the product and try uploading again.
                  </p>
                  <button 
                    className="w-full md:w-auto px-8 bg-white border-2 border-[#d0021b] hover:bg-[#fff0f0] text-[#d0021b] py-3 rounded-full font-bold shadow-sm transition-colors text-lg"
                    onClick={() => {
                      setAiResponse(null);
                      setSelectedFiles([]);
                      setPreviewUrls([]);
                      setCustomerNotes("");
                    }}
                  >
                    Retake / Re-upload Photos
                  </button>
                </div>
              )}
              {/* ST-STANDARD: STANDARD RETURN */}
              {aiResponse.routing?.action === "STANDARD_RETURN" && (
                <div className="bg-white border-2 border-[#d5d9d9] rounded-xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 text-gray-900 font-bold text-2xl mb-4">
                    <span className="text-3xl">📦</span> Return Approved
                  </div>
                  <p className="text-gray-700 mb-6 text-lg">
                    We've verified your item. You are fully eligible for a standard return and full refund.
                  </p>
                  <button 
                    className="w-full md:w-auto px-8 bg-[#ffd814] hover:bg-[#f7ca00] text-black py-3 rounded-full font-bold shadow-sm transition-colors text-lg"
                    onClick={() => toast.success("Return Shipping Label Generated & Emailed!")}
                  >
                    Generate Return Shipping Label
                  </button>
                </div>
              )}

              {/* ST-CASHBACK: INSTANT CASHBACK */}
              {aiResponse.routing?.action === "INSTANT_CASHBACK" && (
                <div className="bg-[#f0fff4] border-2 border-[#38a169] rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#38a169] opacity-10 rounded-full -mr-10 -mt-10"></div>
                  
                  <div className="flex items-center gap-3 text-[#276749] font-bold text-2xl mb-4 relative z-10">
                    <span className="text-3xl">💰</span> Keep it & Get Paid!
                  </div>
                  
                  <p className="text-gray-800 text-lg mb-6 relative z-10">
                    Rufus detected minor cosmetic wear ({aiResponse.routing.severity} severity). Since the item is structurally sound, instead of shipping it back, you can keep it and we will instantly credit your Amazon Pay Wallet!
                  </p>
                  
                  <div className="bg-white rounded-xl p-6 mb-8 border border-[#38a169] text-center shadow-inner relative z-10">
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Instant Wallet Credit</div>
                    <div className="text-5xl font-black text-[#38a169]">
                      ₹{aiResponse.routing.cashback_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                    <button 
                      className="flex-1 bg-[#38a169] hover:bg-[#2f855a] text-white py-4 rounded-xl font-bold shadow-md transition-colors text-lg"
                      onClick={() => toast.success(`₹${aiResponse.routing.cashback_amount} added to your Amazon Pay Wallet!`)}
                    >
                      Accept Instant Cash
                    </button>
                    <button 
                      className="px-6 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-600 py-4 rounded-xl font-bold shadow-sm transition-colors text-lg"
                      onClick={() => toast.success("Proceeding to Standard Return")}
                    >
                      No thanks, Return it
                    </button>
                  </div>
                </div>
              )}
              
              {/* Optional Debug Telemetry */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                 <details className="text-sm text-gray-500 cursor-pointer">
                   <summary className="font-bold hover:text-gray-700">View Rufus Debug Telemetry</summary>
                   <pre className="mt-4 bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-200">
                     {JSON.stringify(aiResponse, null, 2)}
                   </pre>
                 </details>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[60] p-4 backdrop-blur-md" 
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
