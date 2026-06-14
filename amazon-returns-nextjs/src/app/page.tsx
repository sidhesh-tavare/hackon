"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ordersDb from "../data/orders-db.json";
import productsDb from "../data/products.json";
import toast from "react-hot-toast";

export default function Home() {
  const [rufusChatOrderId, setRufusChatOrderId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isGrading, setIsGrading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);
  
  const activeOrder = rufusChatOrderId ? (ordersDb.orders as any)[rufusChatOrderId] : null;
  const activeProduct = activeOrder ? (productsDb.catalog as any)[activeOrder.asin] : null;

  // Simulated current date
  const CURRENT_DATE = new Date("2026-06-14");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    setIsUploading(true);
    setUploadProgress(0);
    setAiResponse(null);
    
    const urls = files.map(file => URL.createObjectURL(file));
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

  const handleSubmitForGrading = async () => {
    if (selectedFiles.length === 0 || !activeProduct) return;
    
    setIsGrading(true);
    const loadingToast = toast.loading("Rufus AI is evaluating for Resale...");
    
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));
      formData.append("product_name", activeProduct.title);
      formData.append("category", activeProduct.category);
      formData.append("sub_category", activeProduct.sub_category);
      formData.append("expected_color", activeProduct.attributes?.color || "Unknown");
      formData.append("reason", "Resale Evaluation");
      
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
      toast.success("AI Evaluation Complete!", { id: loadingToast });
      
    } catch (err: any) {
      toast.error(err.message || "An error occurred during evaluation.", { id: loadingToast });
    } finally {
      setIsGrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const getReturnEligibility = (order: any, product: any) => {
    if (!product.compliance_flags.is_returnable) {
      return { eligible: false, reason: "Not a returnable category" };
    }
    
    const endDate = new Date(order.timeline.return_window_ends_at);
    
    if (CURRENT_DATE > endDate) {
      return { eligible: false, reason: "Return window closed on " + formatDate(endDate.toISOString()) };
    }
    
    return { eligible: true, reason: "Eligible till " + formatDate(endDate.toISOString()) };
  };

  const router = useRouter();

  const handleReturnAction = (orderId: string) => {
    router.push(`/return/${orderId}`);
  };

  return (
    <div className="amz-container pb-20">
      <div className="text-sm text-[#565959] mb-4">
        Your Account &gt; <span className="text-[#c45500]">Your Orders</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-normal">Your Orders</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search all orders" 
            className="border border-[#888c8c] rounded px-3 py-1.5 flex-grow md:w-64 outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)]"
          />
          <button className="bg-[#343a40] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow hover:bg-[#232f3e]">
            Search Orders
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#d5d9d9] flex gap-6 mb-4 text-sm">
        <div className="font-bold border-b-2 border-[#e77600] pb-2 text-black">Orders</div>
        <div className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer pb-2">Buy Again</div>
        <div className="text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer pb-2">Not Yet Shipped</div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="font-bold">{Object.keys(ordersDb.orders).length} orders</span> placed in
        <select className="bg-[#f0f2f2] border border-[#d5d9d9] rounded px-2 py-1 shadow-sm outline-none focus:border-[#e77600] ml-1">
          <option>past 3 months</option>
          <option>2026</option>
          <option>2025</option>
        </select>
      </div>

      <div className="flex flex-col">
        {Object.entries(ordersDb.orders).map(([orderId, order]: [string, any]) => {
          const product = (productsDb.catalog as any)[order.asin];
          if (!product) return null;
          
          const returnStatus = getReturnEligibility(order, product);
          
          return (
            <div key={orderId} className="amz-card">
              <div className="amz-card-header">
                <div className="flex gap-4 md:gap-8 text-[#565959]">
                  <div>
                    <div className="uppercase text-[11px] mb-1">Order Placed</div>
                    <div className="text-[#0f1111] text-[13px]">{formatDate(order.timeline.ordered_at)}</div>
                  </div>
                  <div>
                    <div className="uppercase text-[11px] mb-1">Total</div>
                    <div className="text-[#0f1111] text-[13px]">₹{order.purchase_price_inr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="uppercase text-[11px] mb-1">Ship To</div>
                    <div className="text-[#007185] text-[13px] hover:text-[#c45500] hover:underline cursor-pointer">
                      {order.shipping_details.delivery_city} <span className="text-[10px]">▼</span>
                    </div>
                  </div>
                </div>
                <div className="text-right mt-2 md:mt-0 text-[#565959]">
                  <div className="uppercase text-[11px] mb-1">Order # {orderId.replace('ORD-', '404-5964293-')}</div>
                  <div className="flex gap-2 justify-end text-[#007185] text-[13px]">
                    <span className="hover:text-[#c45500] hover:underline cursor-pointer">View order details</span>
                    <span className="text-[#d5d9d9]">|</span>
                    <span className="hover:text-[#c45500] hover:underline cursor-pointer">Invoice ▼</span>
                  </div>
                </div>
              </div>

              <div className="amz-card-body">
                <div className="w-full flex-grow flex flex-col md:flex-row gap-4">
                  
                  {/* Left content: Status, Image, Title */}
                  <div className="w-full md:w-auto flex-grow">
                    <div className="font-bold text-[#0f1111] text-base mb-1">
                       Delivered {formatDate(order.timeline.delivered_at).split(' ').slice(0,2).join(' ')}
                    </div>
                    <div className="text-[13px] text-[#0f1111] mb-3">
                       Package was handed to resident
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain" />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-[#007185] hover:text-[#c45500] hover:underline cursor-pointer mb-1 text-[13px] line-clamp-2">
                          {product.title}
                        </h3>
                        
                        {returnStatus.eligible && (
                          <p className="text-xs text-[#0f1111] mt-1 mb-2">Replace item: <span className="text-[#565959]">{returnStatus.reason}</span></p>
                        )}
                        
                        <button className="amz-btn-secondary w-auto inline-block text-[11px] py-1 px-3 mt-1 font-normal text-[#0f1111] rounded-full border-[#d5d9d9]">
                          View your item
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right content: Buttons */}
                  <div className="w-full md:w-[250px] flex flex-col gap-2 flex-shrink-0 text-[13px]">
                    <button className="amz-btn-secondary py-1.5 shadow-sm text-[#0f1111] border-[#d5d9d9]">Track package</button>
                    
                    {/* Return Button with Tooltip if disabled */}
                    <div title={!returnStatus.eligible ? returnStatus.reason : undefined}>
                      <button 
                        onClick={() => handleReturnAction(orderId)}
                        disabled={!returnStatus.eligible}
                        className="amz-btn-secondary py-1.5 shadow-sm text-[#0f1111] border-[#d5d9d9]"
                      >
                        Return or replace items
                      </button>
                    </div>
                    
                    <button className="amz-btn-secondary py-1.5 shadow-sm text-[#0f1111] border-[#d5d9d9]">Share gift receipt</button>
                    <button className="amz-btn-secondary py-1.5 shadow-sm text-[#0f1111] border-[#d5d9d9]">Leave seller feedback</button>
                    <button className="amz-btn-secondary py-1.5 shadow-sm text-[#0f1111] border-[#d5d9d9]">Leave delivery feedback</button>
                    <button className="amz-btn-secondary py-1.5 shadow-sm text-[#0f1111] border-[#d5d9d9]">Write a product review</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Basic Modals */}
      {/* We removed the activeModal "valid" since it now redirects to a new page */}

      {/* Rufus Modal */}
      {rufusChatOrderId && activeOrder && activeProduct && (
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
                <button className="text-2xl hover:text-black leading-none" onClick={() => { setRufusChatOrderId(null); setSelectedFiles([]); setPreviewUrls([]); setAiResponse(null); }}>✕</button>
              </div>
            </div>
            
            {/* Rufus Chat Body */}
            <div className="flex-grow overflow-y-auto p-5 flex flex-col gap-4 text-[14px] bg-white">
              
              {/* User Prompt Simulation */}
              <div className="self-end bg-[#eef1f4] rounded-2xl px-4 py-2 max-w-[85%] text-black">
                I'd like to check if this item is eligible for the Second Chance Resale program.
              </div>

              {/* Rufus Response */}
              <div className="text-[#0f1111] leading-relaxed">
                <p className="mb-2">
                  I can help you evaluate the <strong>{activeProduct.title}</strong> for resale.
                </p>
                <div className="mb-2">
                  <strong>Product Details:</strong>
                  <ul className="list-disc pl-5 mt-1">
                    <li><strong>Category:</strong> {activeProduct.category}</li>
                    <li><strong>Sub Category:</strong> {activeProduct.sub_category}</li>
                    {Object.entries(activeProduct.attributes || {}).map(([key, val]) => (
                      <li key={key} className="capitalize"><strong>{key.replace('_', ' ')}:</strong> {val as string}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Next Step:</strong>
                  <br/>
                  • Please upload up to 5 clear photos showing the current condition of the item and its packaging.
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

              {/* Action Pills */}
              <div className="flex flex-col gap-2 mt-2 items-start">
                <label className="bg-[#e7f4fa] text-[#007185] px-4 py-2 rounded-full cursor-pointer hover:bg-[#d4edf8] transition-colors font-medium">
                  Select Images (Max 5)
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
                
                {!isUploading && !isGrading && !aiResponse && selectedFiles.length > 0 && (
                  <button className="bg-[#e7f4fa] text-[#007185] px-4 py-2 rounded-full cursor-pointer hover:bg-[#d4edf8] transition-colors font-medium"
                          onClick={handleSubmitForGrading}>
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
