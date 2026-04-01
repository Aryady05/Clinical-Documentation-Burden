import { useState, useCallback } from 'react'
import Header            from './Header'
import PatientForm       from './PatientForm'
import Recorder          from './Recorder'
import MedicalCard       from './MedicalCard'
import Loader            from './Loader'
import Toast             from './Toast'
import StepIndicator     from './StepIndicator'
import { structureTranscript, downloadReport } from './api'
import styles            from './App.module.css'

const INITIAL_META = { patientName: '', doctorName: '', date: '' }

export default function App() {
  const [meta,          setMeta]         = useState(INITIAL_META)
  const [record,        setRecord]       = useState(null)
  const [loading,       setLoading]      = useState(false)
  const [loadingMsg,    setLoadingMsg]   = useState('')
  const [isDownloading, setIsDownloading]= useState(false)
  const [toast,         setToast]        = useState(null)
  const [step,          setStep]         = useState(1)

  // Derive current step for indicator
  const indicatorStep = record ? 3 : step

  function showToast(message, type = 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4500)
  }

  function handleMetaChange(key, value) {
    setMeta(prev => ({ ...prev, [key]: value }))
  }

  const handleTranscriptReady = useCallback(async (transcript) => {
    if (!meta.patientName.trim()) {
      showToast('Please enter the patient name before analysing.')
      return
    }

    setLoading(true)
    setLoadingMsg('Analysing consultation with AI…')
    setStep(2)

    try {
      const structured = await structureTranscript(transcript, {
        patientName: meta.patientName || 'Unknown',
        doctorName:  meta.doctorName  || 'Unknown',
        date:        meta.date        || null,
      })
      setRecord(structured)
      setStep(3)
      showToast('Medical record structured successfully!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to analyse transcript. Is the backend running?')
      setStep(1)
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }, [meta])

  const handleDownload = useCallback(async () => {
    if (!record) return
    setIsDownloading(true)
    try {
      await downloadReport(record)
      showToast('PDF downloaded!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Failed to generate PDF. Check backend logs.')
    } finally {
      setIsDownloading(false)
    }
  }, [record])

  function handleReset() {
    setRecord(null)
    setMeta(INITIAL_META)
    setStep(1)
  }

  return (
    <div className={styles.app}>
      {/* Ambient background blobs */}
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />

      <div className={styles.container}>
        <Header />

        <StepIndicator currentStep={indicatorStep} />

        {!record && (
          <>
            <PatientForm values={meta} onChange={handleMetaChange} />
            <Recorder onTranscriptReady={handleTranscriptReady} />
          </>
        )}

        {loading && (
          <div className={styles.loaderWrap}>
            <Loader message={loadingMsg} />
          </div>
        )}

        {record && !loading && (
          <>
            <MedicalCard
              record={record}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
            <div className={styles.resetRow}>
              <button className={styles.resetBtn} onClick={handleReset}>
                ← New Consultation
              </button>
            </div>
          </>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
