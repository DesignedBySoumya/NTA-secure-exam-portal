import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase, logAudit } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { QrCode, Camera, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QRScanner() {
  const { user } = useAuth()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [centerId, setCenterId] = useState(null)
  const videoRef = useRef()
  const streamRef = useRef()
  const intervalRef = useRef()

  useEffect(() => {
    supabase.from('user_roles').select('center_id').eq('user_id', user.id).single()
      .then(({ data }) => setCenterId(data?.center_id))
    return () => stopCamera()
  }, [user])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)
      // Poll for QR frames
      intervalRef.current = setInterval(() => processFrame(), 500)
    } catch {
      toast.error('Camera access denied. Use manual entry below.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (intervalRef.current) clearInterval(intervalRef.current)
    setScanning(false)
  }

  const processFrame = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    // jsqr would go here in production, using manual verify for demo
  }, [])

  const verifyQR = async (qrData) => {
    setLoading(true)
    setResult(null)
    try {
      let parsed
      try { parsed = JSON.parse(qrData) } catch { toast.error('Invalid QR code format'); setLoading(false); return }

      // Find admit card by roll number
      const { data: admit, error: admitErr } = await supabase
        .from('admit_cards')
        .select('*, applications(*, students(*), exam_centers(name))')
        .eq('roll_number', parsed.roll)
        .maybeSingle()

      if (admitErr || !admit) { toast.error('Invalid admit card — not found'); setLoading(false); return }

      // Check for duplicate
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('application_id', admit.application_id)
        .maybeSingle()

      if (existing) {
        setResult({ type: 'duplicate', admit, message: 'Already marked present — duplicate entry attempt blocked!' })
        await logAudit('DUPLICATE_SCAN_BLOCKED', { roll: parsed.roll, application_id: admit.application_id })
        setLoading(false)
        return
      }

      // Mark attendance — only columns that exist in the attendance table
      const { error: attErr } = await supabase.from('attendance').insert({
        application_id: admit.application_id,
        status: 'present',
        biometric_verified: true,
      })

      if (attErr) {
        console.error('Attendance insert error:', attErr)
        toast.error('Failed to mark attendance: ' + attErr.message)
        setLoading(false)
        return
      }

      await logAudit('STUDENT_VERIFIED', { roll: parsed.roll, name: admit.applications?.students?.full_name })
      setResult({ type: 'success', admit })
      toast.success('Student verified and marked present!')
    } catch (err) {
      toast.error(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleManualVerify = (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    // Try roll number lookup
    verifyByRoll(manualInput.trim())
  }

  const verifyByRoll = async (roll) => {
    setLoading(true)
    setResult(null)
    try {
      const qrData = JSON.stringify({ roll: roll, app_id: '' })
      await verifyQR(qrData)
    } catch (err) {
      toast.error('Not found')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">QR Code Scanner</h1>
        <p className="page-subtitle">Scan admit cards to verify and mark student attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Camera size={18} className="text-blue-700" />
            Camera Scanner
          </h2>
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <QrCode size={48} className="opacity-30 mb-3" />
                <p className="text-sm opacity-60">Camera not started</p>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-green-400 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br" />
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 animate-[scan_2s_linear_infinite]" />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {!scanning ? (
              <button onClick={startCamera} className="btn-primary flex-1">
                <Camera size={16} /> Start Camera
              </button>
            ) : (
              <button onClick={stopCamera} className="btn-danger flex-1">
                Stop Camera
              </button>
            )}
          </div>
        </div>

        {/* Manual entry */}
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-4">Manual Entry</h2>
            <p className="text-sm text-gray-500 mb-4">Enter the roll number or paste QR data manually</p>
            <form onSubmit={handleManualVerify} className="space-y-3">
              <input
                className="form-input font-mono"
                placeholder="Roll Number (e.g. NEB2026001001)"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
              />
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                Verify & Mark Present
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
            <div className={`card border-2 ${result.type === 'success' ? 'border-green-300 bg-green-50' : result.type === 'duplicate' ? 'border-orange-300 bg-orange-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.type === 'success' && <CheckCircle size={28} className="text-green-500" />}
                {result.type === 'duplicate' && <AlertTriangle size={28} className="text-orange-500" />}
                {result.type === 'error' && <XCircle size={28} className="text-red-500" />}
                <div>
                  <p className="font-bold text-gray-900">
                    {result.type === 'success' ? '✓ Verified & Marked Present' :
                     result.type === 'duplicate' ? '⚠ Duplicate Entry Blocked' : '✗ Verification Failed'}
                  </p>
                  {result.message && <p className="text-xs text-gray-600">{result.message}</p>}
                </div>
              </div>

              {result.admit && (
                <div className="flex gap-4 items-start">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {result.admit.applications?.students?.photo_url
                      ? <img src={result.admit.applications.students.photo_url} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Photo</div>}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-gray-900 text-base">{result.admit.applications?.students?.full_name}</p>
                    <p className="text-gray-600">Roll: <span className="font-mono font-bold">{result.admit.roll_number}</span></p>
                    <p className="text-gray-600">Post: {result.admit.applications?.exam_post}</p>
                    <p className="text-gray-600">Center: {result.admit.applications?.exam_centers?.name}</p>
                    <p className="text-gray-600">Category: {result.admit.applications?.students?.category}</p>
                  </div>
                </div>
              )}

              <button onClick={() => { setResult(null); setManualInput('') }} className="w-full mt-4 btn-secondary">
                <RefreshCw size={14} /> Scan Next Student
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(192px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
