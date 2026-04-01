import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

/**
 * Send browser speech-to-text result to backend (no Whisper needed).
 * @param {string} text
 */
export async function transcribeText(text) {
  const { data } = await api.post('/transcribe/text', { text })
  return data.transcript
}

/**
 * Upload an audio blob → Whisper transcription.
 * @param {Blob} audioBlob
 */
export async function transcribeAudio(audioBlob) {
  const form = new FormData()
  form.append('file', audioBlob, 'recording.webm')
  const { data } = await api.post('/transcribe/audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.transcript
}

/**
 * Ask Claude/Gemini to structure a transcript into a MedicalRecord.
 * @param {string} transcript
 * @param {{ patientName, doctorName, date }} meta
 */
export async function structureTranscript(transcript, { patientName, doctorName, date }) {
  const { data } = await api.post('/structure/', {
    transcript,
    patient_name: patientName,
    doctor_name: doctorName,
    date,
  })
  return data.record
}

/**
 * Generate a PDF from a MedicalRecord and trigger a browser download.
 * @param {object} record
 */
export async function downloadReport(record) {
  const response = await api.post(
    '/report/generate',
    { record },
    { responseType: 'blob' }
  )
  const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `report_${record.patient_name.replace(/\s+/g, '_')}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
