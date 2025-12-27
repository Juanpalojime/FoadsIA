
import React, { useState, useCallback, useMemo } from 'react';
import { WizardStep, BrandImage, NavItem } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import ConfigStep from './components/ConfigStep';
import ReviewStep from './components/ReviewStep';

const INITIAL_IMAGES: BrandImage[] = [
  { id: '1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC6fNWLACUfi5NGMcl2WQQqnWafu1-15vz8Bnv5gjs6PjE5yDdUrZlP8LEtPDaPaOD8KC4uvBBf7Fy7Eup97jgKDsCkv-t1xXdDAX_waWPuyMJiKgGjFfYsZfLTAu5nTBu4qPETkv_9jzqkERuMGQlzOmrKLbaWJej3C_QyNCqrItWHcK5gf0YlFyvmp2lOh5LjAwR9Mh9e69loGxNi4WQSGvfsSuUE6S8zgI_aNbW5wHpxhnWl_j_0qFMtipHHiKL6OSrA8k1_9Xd', alt: 'Red sneaker on yellow background', selected: true },
  { id: '2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNolIH82mHaLHTLr1alVrGCqv-SsjzRWdJYDaDM1DxHiSGCn07uh0WXG6KYLaaGR4jHIy6ESPlQLCGO1um4JM9skP8tnxJRzIhF1VRtuakwHicKpVd821LoVj86fB6gkb_cF1ikQbCBfj6I8uh4jTF8kto7ZzTKEumvOQGalIJoJZis8UDSeirxnC7ziBKkp1Vpnub9WqGE3Ugyp7FDkj1E4egBSQe4Y7w9E62xo9yS3QvFeE8nszn03V5cvxFLsNJgf-PAEIT-oIt', alt: 'White sneaker close up', selected: true },
  { id: '3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAduYNQf6MgBK7-zCR2LznMGCeetLe-sTLLYISUg2270ziYnEdmd5YpYfHAXRm6q0Q8vQKRAxCrz8DrR3WnlH7j67s-kkXQsV6lqFbEm43O5Tw6LBp4j81NfjfGOHvXJ_iq7xen3yNrf6V2iXzK0V2FSOWuksT-fYdnxATDybrCyUNWcnGbaI4F95GN1yWmQyEh1coSOogdd6QgWjVuH4JxQ73L7OzB1e_ayQ1XpRc2r6GJhnxg3aqRd9gOnYzgx4_bPk3eccJsHE8p', alt: 'Running shoes on concrete', selected: true },
  { id: '4', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtWtcCuDQXhXFspmeBDm-tnZMz5vIWYPckrwNJLX_D0BJLNJHLtQ4kZEf4xqS9uNe8SJZ0U29xrkln_hP_UC88iTamgeM7R7maqqorUCiw07RhysIMQzpFIPqena_J5l0ln1YGsDiPi7RKw2MD_kK7ZadmtxkPXI5tWSKhm2OtBbLipnmR3j1qXq1eEHXLiWEUKPft-UMZY5Nncp0HFzvU15K6UbiwFb1EPf8IeHjOwKkPBIfCuvUx_U7c0B_DeS8VHLGmtArMaLCK', alt: 'Green high top sneakers', selected: true },
  { id: '5', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnKu-9BDRF16ZNdUQ6WHPgReFdQnU0rwlpFpvzGflTNMwFlG2cCGy3DbL6j7dLF31vMbn9XNP5AyD9g-qlQcaTyMOeEPrqiGOZCttv3j6-nk8Ga1hJANo7mVmylIv6pcgylnWkF4IjzmyO1MbJKw5PHdV-_yleXM3YzDNV8B0y_-3B9ySFy5nO85QRBtsh2CF2HGd9NlksJhFB2_s91xYo7xAiz4qg0zcEXzneuJYsR9vq7FWblvBHntQRAtG1mdA7GIlM6YpPvmN0', alt: 'Casual walking shoes', selected: true },
  { id: '6', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAELaxjsSPvAy2wePRUp6FMUfwKDM6zOPIq757dWBhkvNmfoXcoH3LB2EcrvOEJ83p_e6kk7Rt7NLlIaOhMy-7vu5NDU5Kzu__D9r07RENvSFOvdfVUlOy5SsisPX7yhvxRT_635e0Ob8FEV4PAXB6Ckegw_iehdDbtBWlHyUS7pdTo-4AHYeIKknJbMvp3fuVhdJGveYp3Ci04LN9kjU8qWYbZX2ejEovLvVqF4CiDsdyklKw6nuddlYnowtrVeJbs532RBRv0zatX', alt: 'Nike shoes branding', selected: true },
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.UPLOAD);
  const [images, setImages] = useState<BrandImage[]>(INITIAL_IMAGES);

  const selectedCount = useMemo(() => images.filter(img => img.selected).length, [images]);

  const handleToggleSelect = useCallback((id: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, selected: !img.selected } : img));
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleUpload = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const newImages: BrandImage[] = Array.from(newFiles).map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      selected: true,
    }));
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleClearAll = useCallback(() => {
    setImages(prev => prev.map(img => ({ ...img, selected: false })));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  return (
    <div className="flex h-screen bg-background-dark text-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header currentStep={currentStep} />
        
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 pb-32">
            
            {currentStep === WizardStep.UPLOAD && (
              <div className="animate-fade-in space-y-8">
                <UploadZone onUpload={handleUpload} />
                <Gallery 
                  images={images} 
                  onToggleSelect={handleToggleSelect} 
                  onDelete={handleDeleteImage} 
                />
              </div>
            )}

            {currentStep === WizardStep.CONFIG && (
              <ConfigStep images={images} onBack={prevStep} />
            )}

            {currentStep === WizardStep.REVIEW && (
              <ReviewStep images={images} onRestart={() => setCurrentStep(WizardStep.UPLOAD)} />
            )}
            
          </div>
        </div>

        {currentStep === WizardStep.UPLOAD && (
          <Footer 
            selectedCount={selectedCount} 
            maxCount={40} 
            onClearAll={handleClearAll}
            onNext={nextStep}
          />
        )}
      </main>
    </div>
  );
};

export default App;
