"use client"

import { useState, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import Footer from "@/components/footer"
import HeroSection from "./_components/hero-section"
import ProgressIndicator from "./_components/progress-indicator"
import TypeSelector from "./_components/type-selector"
import IdentityForm from "./_components/identity-form"
import MessageForm from "./_components/message-form"
import FormNavigation from "./_components/form-navigation"
import FaqSection from "./_components/faq-section"
import SuccessModal from "./_components/success-modal"
import { feedbackOptions, faqItems } from "./_components/constants"
import { enviarManifestacao } from "./actions"
import type { FeedbackType, FormData } from "./_components/types"
import Navigation from "@/components/navigation"

export default function FeedbackPage() {
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  })
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const formRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async () => {
    if (!selectedType || !formData.message) return

    setIsSubmitting(true)

    try {
      const result = await enviarManifestacao({
        tipo: selectedType,
        conteudo: formData.message,
        anonimo: isAnonymous,
        nome: isAnonymous ? undefined : formData.name,
        email: formData.email || undefined,
      })

      if (result.success) {
        setShowSuccess(true)
      } else {
        toast.error(result.error || "Erro ao enviar manifestação")
      }
    } catch (error) {
      toast.error("Erro ao enviar manifestação. Tente novamente.")
      console.error("Erro ao enviar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedType(null)
    setFormData({ name: "", email: "", message: "" })
    setIsAnonymous(false)
    setShowSuccess(false)
    setCurrentStep(1)
  }

  const goToNextStep = () => {
    if (currentStep === 1 && selectedType) {
      setCurrentStep(2)
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } else if (currentStep === 2 && (isAnonymous || formData.name)) {
      setCurrentStep(3)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return selectedType !== null
    if (currentStep === 2) return isAnonymous || formData.name.length > 0
    if (currentStep === 3) return formData.message.length >= 10
    return false
  }

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-purple-500/30 relative overflow-hidden">
      <Navigation />
      {/* Subtle gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-indigo-900/15 rounded-full blur-[120px]" />
        <div className="absolute top-2/3 left-1/3 w-48 h-48 bg-violet-900/10 rounded-full blur-[80px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <ProgressIndicator currentStep={currentStep} />

        {/* Form Section */}
        <section ref={formRef} className="px-4 pb-12 md:pb-24">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <TypeSelector selectedType={selectedType} onSelect={setSelectedType} options={feedbackOptions} />
              )}

              {currentStep === 2 && (
                <IdentityForm
                  isAnonymous={isAnonymous}
                  formData={formData}
                  onToggleAnonymous={() => setIsAnonymous(!isAnonymous)}
                  onFormChange={handleFormChange}
                />
              )}

              {currentStep === 3 && (
                <MessageForm
                  formData={formData}
                  selectedType={selectedType}
                  isAnonymous={isAnonymous}
                  options={feedbackOptions}
                  onFormChange={handleFormChange}
                />
              )}
            </AnimatePresence>

            <FormNavigation
              currentStep={currentStep}
              isSubmitting={isSubmitting}
              canProceed={canProceed()}
              onBack={() => setCurrentStep(currentStep - 1)}
              onNext={goToNextStep}
              onSubmit={handleSubmit}
            />
          </div>
        </section>

        <FaqSection items={faqItems} expandedIndex={expandedFaq} onToggle={(index) => setExpandedFaq(expandedFaq === index ? null : index)} />

        <Footer />
      </div>

      <SuccessModal show={showSuccess} onClose={resetForm} />
    </main>
  )
}
