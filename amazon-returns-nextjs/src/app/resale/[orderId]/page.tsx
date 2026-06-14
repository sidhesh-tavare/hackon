
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ordersDb from "../../../data/orders-db.json";
import productsDb from "../../../data/products.json";
import toast from "react-hot-toast";

export default function ResalePage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const router = useRouter();

  const order = (ordersDb.orders as any)[orderId];
  if (!order) return <div className="p-8 text-center font-bold">Order not found</div>;
  
  const product = (productsDb.catalog as any)[order.asin];
  if (!product) return <div className="p-8 text-center font-bold">Product not found</div>;

  const [currentStep, setCurrentStep] = useState(1);
  const [condition, setCondition] = useState("");
  const [warranty, setWarranty] = useState("");
  const [originalPackaging, setOriginalPackaging] = useState("Yes");
  const [functionality, setFunctionality] = useState("");
  const [pincode, setPincode] = useState(order.shipping_details?.delivery_pincode || "");
  const [selectedBoxItems, setSelectedBoxItems] = useState<string[]>(product.whats_in_the_box || []);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [actualFiles, setActualFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  const variantDetails = product.attributes ? Object.entries(product.attributes).map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`).join(' | ') : 'N/A';
  
  const purchaseDate = new Date(order.timeline.ordered_at);
  const deliveryDate = new Date(order.timeline.delivered_at);
  const productAgeDays = Math.floor((new Date().getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = filesArray.map(file => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
      setActualFiles([...actualFiles, ...filesArray]);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (actualFiles.length === 0) {
      toast.error("Please upload at least 1 image.");
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      actualFiles.forEach((file) => formData.append("files", file));
      
      formData.append("product_name", product.title);
      formData.append("original_price", order.purchase_price_inr.toString());
      formData.append("age_days", productAgeDays.toString());
      formData.append("declared_condition", condition);
      formData.append("functionality", functionality);
      formData.append("warranty", warranty);
      formData.append("packaging", originalPackaging);
      
      const missingItems = product.whats_in_the_box 
        ? product.whats_in_the_box.filter((item: string) => !selectedBoxItems.includes(item)).join(", ")
        : "";
      formData.append("missing_items", missingItems);

      const response = await fetch("http://localhost:8000/api/resale-verify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setAiAnalysisResult(data);
      setCurrentStep(4);
      toast.success("AI Verification Complete!");
      
    } catch (err: any) {
      console.error(err);
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinalSubmit = () => {
    toast.success("Listing Submitted and Live!");
    router.push('/');
  };

  return (
    <div className="bg-[#eaeded] min-h-screen pt-6 pb-20" style={{ fontFamily: "'Amazon Ember', Arial, sans-serif" }}>
      
      <div className="max-w-[1200px] mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="flex-grow flex flex-col gap-6">
          <div className="bg-white shadow-sm border border-[#d5d9d9] overflow-hidden rounded-md">
            
            {currentStep === 1 && (
              <>
                <div className="bg-gradient-to-r from-[#166534] to-[#22c55e] p-5 text-white">
                  <h2 className="text-2xl font-bold mb-1">Resell your items, the Amazon way.</h2>
                  <p className="text-[#dcfce7] text-[15px] max-w-2xl">You’ve purchased it, loved it, and now you’re ready to pass it on. We handle the heavy lifting so you don't have to.</p>
                </div>
                
                <div className="p-6 bg-white">
                  <h3 className="text-lg font-bold text-[#0f1111] mb-5">Your 3-Step Path to Resale:</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex gap-4 items-start bg-[#f9fafb] p-4 rounded-lg border border-[#d5d9d9] shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#16a34a] font-bold text-[15px] flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                      <div>
                        <div className="font-bold text-[#0f1111] text-[14px] mb-1">Select</div>
                        <div className="text-[13px] text-gray-700">Choose any item from your Order History purchased within the last year. We’ll auto-populate the product details and photos.</div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start bg-[#f9fafb] p-4 rounded-lg border border-[#d5d9d9] shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#16a34a] font-bold text-[15px] flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                      <div>
                        <div className="font-bold text-[#0f1111] text-[14px] mb-1">Verify</div>
                        <div className="text-[13px] text-gray-700">Confirm the item’s condition. Our AI will guide you through a quick, 30-second inspection to ensure your listing is accurate.</div>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start bg-[#f9fafb] p-4 rounded-lg border border-[#d5d9d9] shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#16a34a] font-bold text-[15px] flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                      <div>
                        <div className="font-bold text-[#0f1111] text-[14px] mb-1">Amazon Handles</div>
                        <div className="text-[13px] text-gray-700">Once listed, we manage the buyer inquiries, the inspection, and the shipping. You sit back and get paid once the item finds its new home.</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#0f1111] mb-5">Why Resell with Amazon?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#f0f2f2] p-4 rounded-lg border border-[#d5d9d9]">
                      <div className="font-bold text-[#0f1111] text-[15px] mb-2">Zero Logistics Hassle</div>
                      <div className="text-[13px] text-[#565959]">No printing labels, no answering buyer questions, no shipping to strangers. We take care of it all.</div>
                    </div>
                    <div className="bg-[#f0f2f2] p-5 rounded-lg border border-[#d5d9d9]">
                      <div className="font-bold text-[#0f1111] text-[15px] mb-2">Verified Pricing</div>
                      <div className="text-[13px] text-[#565959]">We use historical data to recommend a fair price that sells, so you don't have to guess.</div>
                    </div>
                    <div className="bg-[#f0f2f2] p-5 rounded-lg border border-[#d5d9d9]">
                      <div className="font-bold text-[#0f1111] text-[15px] mb-2">Secure Payment</div>
                      <div className="text-[13px] text-[#565959]">Your funds are processed directly to your Amazon Pay wallet as soon as the item is verified by our team.</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#0f1111] mb-6 pb-4 border-b border-[#d5d9d9]">Verify Listing Details</h2>
                
                <div className="mb-10 bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-90 cursor-not-allowed">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-bold text-gray-600">Original Purchase Data</h3>
                    <span className="text-[12px] bg-gray-200 text-gray-600 px-2 py-1 rounded font-bold">Auto-Fetched from Catalog</span>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="w-24 h-28 border border-gray-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 rounded p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain grayscale-[20%]" />
                    </div>
                    
                    <div className="flex-grow flex flex-col gap-3">
                      <div>
                        <label className="text-[12px] text-gray-500 font-bold block mb-1">Product Name</label>
                        <input type="text" readOnly disabled value={product.title} className="w-full bg-transparent border-b border-gray-300 text-[14px] text-gray-700 font-bold pb-1 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[12px] text-gray-500 font-bold block mb-1">Variant / Details</label>
                          <input type="text" readOnly disabled value={variantDetails} className="w-full bg-transparent border-b border-gray-300 text-[14px] text-gray-700 pb-1 outline-none" />
                        </div>
                        <div>
                          <label className="text-[12px] text-gray-500 font-bold block mb-1">Purchase Date</label>
                          <input type="text" readOnly disabled value={purchaseDate.toLocaleDateString()} className="w-full bg-transparent border-b border-gray-300 text-[14px] text-gray-700 pb-1 outline-none" />
                        </div>
                      </div>
                      <div className="mt-2 bg-[#fffced] border border-[#fbd361] p-2 inline-flex items-center rounded w-fit">
                        <span className="text-[13px] font-bold text-[#c45500]">Product Age: {productAgeDays} Days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[18px] font-bold text-[#0f1111] mb-4">Current Condition</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[14px] font-bold text-[#0f1111] mb-2">Item Condition (Required)</label>
                      <select 
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full max-w-md border border-[#888c8c] rounded-md p-2 text-[14px] shadow-sm focus:border-[#007185] focus:ring-1 focus:ring-[#007185] outline-none"
                      >
                        <option value="">Select condition...</option>
                        <option value="Like New">Like New</option>
                        <option value="Gently Used">Gently Used</option>
                        <option value="Visible Wear">Visible Wear (Minor cosmetic defects)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold text-[#0f1111] mb-2">Functional Condition</label>
                      <select 
                        value={functionality}
                        onChange={(e) => setFunctionality(e.target.value)}
                        className="w-full max-w-md border border-[#888c8c] rounded-md p-2 text-[14px] shadow-sm focus:border-[#007185] focus:ring-1 focus:ring-[#007185] outline-none"
                      >
                        <option value="">Select functionality...</option>
                        <option value="Fully Functional">Fully Functional</option>
                        <option value="Minor Defects">Minor Defects</option>
                        <option value="Not Working">Not Working</option>
                      </select>
                      {(functionality === "Minor Defects" || functionality === "Not Working") && (
                        <div className="mt-2 text-[#c40000] text-[13px] font-bold">
                          ⚠️ Items must be fully functional to be eligible for Amazon Resale.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold text-[#0f1111] mb-2">Warranty Status</label>
                      <select 
                        value={warranty}
                        onChange={(e) => setWarranty(e.target.value)}
                        className="w-full max-w-md border border-[#888c8c] rounded-md p-2 text-[14px] shadow-sm focus:border-[#007185] focus:ring-1 focus:ring-[#007185] outline-none"
                      >
                        <option value="">Select warranty status...</option>
                        <option value="Under Warranty">Under Warranty</option>
                        <option value="Out of Warranty">Out of Warranty</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[14px] font-bold text-[#0f1111] mb-2">Original Packaging Available?</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="packaging" value="Yes" checked={originalPackaging === "Yes"} onChange={(e) => setOriginalPackaging(e.target.value)} className="w-4 h-4 accent-[#007185]" />
                          <span className="text-[14px] text-[#0f1111]">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="packaging" value="No" checked={originalPackaging === "No"} onChange={(e) => setOriginalPackaging(e.target.value)} className="w-4 h-4 accent-[#007185]" />
                          <span className="text-[14px] text-[#0f1111]">No</span>
                        </label>
                      </div>
                    </div>

                    {product.whats_in_the_box && (
                      <div>
                        <label className="block text-[14px] font-bold text-[#0f1111] mb-2">What's in the box? (Uncheck missing items)</label>
                        <div className="bg-[#f3f3f3] p-4 rounded border border-[#d5d9d9] space-y-2">
                          {product.whats_in_the_box.map((item: string) => (
                            <label key={item} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={selectedBoxItems.includes(item)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedBoxItems([...selectedBoxItems, item]);
                                  else setSelectedBoxItems(selectedBoxItems.filter(i => i !== item));
                                }}
                                className="w-4 h-4 accent-[#007185]" 
                              />
                              <span className="text-[14px] text-[#0f1111]">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[14px] font-bold text-[#0f1111] mb-2">Pickup Pincode</label>
                      <input 
                        type="text" 
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-48 border border-[#888c8c] rounded-md p-2 text-[14px] shadow-sm focus:border-[#007185] focus:ring-1 focus:ring-[#007185] outline-none"
                        placeholder="e.g. 400001"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Step 3: Image Upload */}
            {currentStep === 3 && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#0f1111] mb-6 pb-4 border-b border-[#d5d9d9]">Upload Current Photos</h2>
                
                <p className="mb-6 text-[14px] text-[#565959]">Please upload 2-3 clear photos of the item in its current condition. Our AI will analyze the images to verify the condition against your selection.</p>
                
                <div className="bg-[#f9fafb] p-8 mb-6 border border-[#d5d9d9] rounded-lg text-center border-dashed border-2">
                  <div className="text-[32px] mb-2">📸</div>
                  <label className="cursor-pointer text-[#007185] hover:text-[#c45500] hover:underline font-bold text-[15px]">
                    Click to browse files
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </label>
                  <div className="text-[12px] text-[#565959] mt-2">JPG, PNG up to 5MB</div>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="mb-8">
                    <h5 className="font-bold mb-3 text-[14px]">Uploaded Previews</h5>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {uploadedImages.map((src, idx) => (
                        <div key={idx} className="w-24 h-24 border border-[#d5d9d9] flex-shrink-0 bg-white p-1 rounded">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="Uploaded preview" className="w-full h-full object-cover rounded-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="bg-[#fffced] border border-[#fbd361] p-6 rounded-lg mb-6 text-center flex flex-col items-center shadow-sm">
                    <div className="w-8 h-8 border-4 border-[#007185] border-t-transparent rounded-full animate-spin mb-3"></div>
                    <div className="font-bold text-[16px] text-[#c45500] mb-1">AI Pricing Engine Analyzing...</div>
                    <div className="text-[13px] text-[#565959]">Computing recommended resale price based on condition & age...</div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Verification Result */}
            {currentStep === 4 && aiAnalysisResult && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#166534] mb-6 pb-4 border-b border-[#d5d9d9]">Listing Approved!</h2>
                
                <div className="bg-[#f9fafb] border border-[#dcfce7] rounded-lg p-6 mb-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#dcfce7] rounded-bl-full opacity-50 z-0"></div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-[#0f1111] mb-2">AI Verification Successful</h3>
                    <p className="text-[14px] text-[#565959] mb-6 max-w-lg">Our AI has verified your images and calculated a competitive resale price based on the current market, product age, and condition.</p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-white p-4 border border-[#d5d9d9] rounded shadow-sm">
                        <div className="text-[12px] text-gray-500 font-bold mb-1">Original Price</div>
                        <div className="text-xl font-bold text-[#0f1111]">₹{order.purchase_price_inr.toLocaleString()}</div>
                      </div>
                      <div className="bg-[#fffced] p-4 border border-[#fbd361] rounded shadow-sm">
                        <div className="text-[12px] text-[#c45500] font-bold mb-1">Recommended Resale Price</div>
                        <div className="text-2xl font-bold text-[#c45500]">₹{aiAnalysisResult.recommended_price.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="bg-white p-4 border border-[#d5d9d9] rounded shadow-sm">
                       <h4 className="font-bold text-[#0f1111] text-[14px] mb-2">How we calculated this:</h4>
                       <ul className="list-disc pl-5 text-[13px] text-[#565959] space-y-1">
                         <li><strong>Age factor:</strong> Product is {productAgeDays} days old.</li>
                         <li><strong>Condition:</strong> {aiAnalysisResult.analysis.visual_verification?.observed_condition || condition}.</li>
                         <li><strong>Missing items deduction:</strong> {aiAnalysisResult.analysis.pricing_analysis?.missing_items_deduction || 0} multiplier penalty applied.</li>
                         <li><strong>AI Reasoning:</strong> {aiAnalysisResult.analysis.pricing_analysis?.reasoning}</li>
                       </ul>
                    </div>

                    {/* Debug Telemetry */}
                    <div className="mt-6 border-t border-[#d5d9d9] pt-6">
                      <details className="bg-gray-50 p-4 rounded-md border border-gray-300 shadow-inner">
                        <summary className="font-bold text-[13px] text-gray-700 cursor-pointer outline-none">Developer/Debug: View Raw AI Telemetry JSON</summary>
                        <pre className="mt-4 text-[11px] text-gray-600 overflow-x-auto whitespace-pre-wrap font-mono">
                          {JSON.stringify(aiAnalysisResult, null, 2)}
                        </pre>
                      </details>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Right Column (Sidebar Summary) */}
        <div className="w-full lg:w-[350px] flex-shrink-0">
          <div className="bg-white shadow-sm p-6 border border-[#d5d9d9] rounded-md sticky top-6">
            <h3 className="font-bold text-[18px] mb-4 text-[#0f1111]">Item to be Listed</h3>
            
            <div className="flex gap-4 mb-6 pb-6 border-b border-[#d5d9d9]">
               <div className="w-20 h-24 border border-gray-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 rounded p-1">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={product.primary_image_url} alt={product.title} className="w-full h-full object-contain" />
               </div>
               <div>
                  <div className="text-[14px] font-bold text-[#0f1111] line-clamp-3 mb-1">{product.title}</div>
                  <div className="text-[12px] text-[#565959] mb-2">Brand: {product.brand}</div>
                  <div className="text-[14px] font-bold text-[#0f1111]">Original Price: ₹{order.purchase_price_inr.toLocaleString()}</div>
               </div>
            </div>

            {currentStep === 1 && (
              <button 
                onClick={() => setCurrentStep(2)}
                className="w-full bg-[#dcfce7] border border-[#16a34a] py-2 px-4 shadow-sm text-[#166534] rounded-full hover:bg-[#bbf7d0] transition-colors font-bold text-[13px] mb-3"
              >
                Continue to Step 2
              </button>
            )}

            {currentStep === 2 && (
              <button 
                onClick={() => {
                  if (!condition) {
                    toast.error("Please select an item condition.");
                    return;
                  }
                  if (functionality === "Minor Defects" || functionality === "Not Working") {
                    toast.error("Items must be fully functional to be listed.");
                    return;
                  }
                  setCurrentStep(3);
                }}
                disabled={functionality === "Minor Defects" || functionality === "Not Working"}
                className={`w-full py-2 px-4 shadow-sm rounded-full font-bold text-[13px] mb-3 transition-colors ${
                  functionality === "Minor Defects" || functionality === "Not Working" 
                    ? "bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed" 
                    : "bg-[#dcfce7] border border-[#16a34a] text-[#166534] hover:bg-[#bbf7d0]"
                }`}
              >
                Continue
              </button>
            )}

            {currentStep === 3 && (
              <button 
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-2 px-4 shadow-sm rounded-full font-bold text-[13px] mb-3 transition-colors ${
                  isAnalyzing 
                    ? "bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed" 
                    : "bg-[#dcfce7] border border-[#16a34a] text-[#166534] hover:bg-[#bbf7d0]"
                }`}
              >
                {isAnalyzing ? "Analyzing..." : "Run AI Verification & Pricing"}
              </button>
            )}

            {currentStep === 4 && (
              <button 
                onClick={handleFinalSubmit}
                className="w-full bg-[#f0c14b] border border-[#a88734] hover:bg-[#e3b540] py-2 px-4 shadow-sm text-[#111111] rounded-full transition-colors font-bold text-[13px] mb-3"
              >
                Publish Listing at ₹{aiAnalysisResult?.recommended_price.toLocaleString()}
              </button>
            )}

            <button 
              onClick={() => {
                if (currentStep > 1 && !isAnalyzing) setCurrentStep(currentStep - 1);
                else if (currentStep === 1) router.back();
              }}
              disabled={isAnalyzing || currentStep === 4}
              className={`w-full bg-[#f0f2f2] hover:bg-[#e3e6e6] text-[#0f1111] py-2 px-4 rounded-full text-[13px] font-bold border border-[#d5d9d9] shadow-sm transition-colors ${isAnalyzing || currentStep === 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {currentStep > 1 ? "Back" : "Cancel"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
