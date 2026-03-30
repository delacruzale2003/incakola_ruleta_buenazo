'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, PackageX } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useParams } from 'next/navigation' 

import StoreHeader from '../components/StoreHeader'
import SuccessView from '../components/SuccessView'

const carouselVariant: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 }, 
  visible: { 
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 25 }
  },
  exit: { 
    opacity: 0, x: -100, scale: 0.95, 
    transition: { duration: 0.3, ease: "easeInOut" } 
  }
}

export default function RegisterPage() {
  const CAMPAIGN_NAME = process.env.NEXT_PUBLIC_CAMPAIGN || 'x'
  
  const params = useParams()
  const currentStoreId = params.storeId as string

  const [campaignId, setCampaignId] = useState('')
  const [storeId, setStoreId] = useState('')
  const [storeName, setStoreName] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [hasPrizes, setHasPrizes] = useState<boolean | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const initCampaignAndStore = async () => {
      if (!currentStoreId) {
        setIsValid(false)
        return
      }

      setStoreId(currentStoreId)

      const { data: campaign, error: campError } = await supabase
        .from('campaigns')
        .select('id, is_active')
        .eq('name', CAMPAIGN_NAME)
        .single()

      if (campError || !campaign || !campaign.is_active) {
        setIsValid(false)
        return
      }
      setCampaignId(campaign.id)

      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, is_active, name')
        .eq('id', currentStoreId)
        .eq('campaign_id', campaign.id)
        .single()

      if (storeError || !store || !store.is_active) {
        setIsValid(false)
        return
      }

      setStoreName(store.name || '')

      const { data: prizes } = await supabase
        .from('prizes')
        .select('id, stock')
        .eq('store_id', currentStoreId)
        .eq('is_active', true)
        .gt('stock', 0)

      if (!prizes || prizes.length === 0) {
        setHasPrizes(false)
        setIsValid(true)
      } else {
        setHasPrizes(true)
        setIsValid(true)
      }
    }

    initCampaignAndStore()
  }, [CAMPAIGN_NAME, currentStoreId])

  // --- NUEVA LÓGICA DE JUEGO DIRECTO ---
  const handlePlay = async () => {
    setLoading(true)
    setError('')

    try {
      // 1. Verificar premios disponibles en tiempo real
      const { data: availablePrizes, error: fetchError } = await supabase
        .from('prizes')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .gt('stock', 0)

      if (fetchError || !availablePrizes || availablePrizes.length === 0) {
        setError('Los premios se acaban de agotar.')
        setHasPrizes(false) // Actualizamos la pantalla de agotado
        setLoading(false)
        return
      }

      // 2. Elegir premio al azar
      const randomPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)]

      // 3. Registrar jugada anónima en la BD
      const { error: insertError } = await supabase.from('registrations').insert({
        full_name: 'Anónimo', // Dato dummy porque es NOT NULL en tu tabla
        dni: 'N/A',           // Dato dummy porque es NOT NULL en tu tabla
        email: null,
        phone: null,
        voucher_url: null,
        campaign_id: campaignId,
        store_id: storeId,
        prize_id: randomPrize.id
      })

      if (insertError) throw new Error('insert_failed')
      
      // 4. Actualizar el stock del premio (-1)
      const { error: updateError } = await supabase
        .from('prizes')
        .update({ stock: randomPrize.stock - 1 })
        .eq('id', randomPrize.id)

      if (updateError) console.error("Error actualizando stock:", updateError)

      // 5. Lanzar pantalla de éxito
      setSuccess(randomPrize)

    } catch (err: any) { 
      console.error(err)
      setError('¡Ups! Tuvimos un inconveniente. Intenta de nuevo.') 
    } finally { 
      setLoading(false) 
    }
  }

  // PANTALLAS DE CARGA Y ERROR
  if (isValid === null || (isValid === true && hasPrizes === null)) return (
    <div className="min-h-screen bg-[#ffd602] flex items-center justify-center relative z-10">
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
        <Loader2 className="text-black/50" size={50} />
      </motion.div>
    </div>
  )
  
  if (isValid === false) return (
    <div className="min-h-screen bg-[#ffd602] flex flex-col items-center justify-center p-6 text-black text-center relative z-10">
      <AlertCircle size={64} className="mb-4 opacity-50" />
      <h1 className="text-2xl font-black uppercase tracking-tighter">Acceso no válido</h1>
      <p className="opacity-80">El código QR es incorrecto, la campaña ha finalizado o la tienda no pertenece a esta campaña.</p>
    </div>
  )

  if (hasPrizes === false) return (
    <div className="min-h-screen bg-[#ffd602] flex flex-col items-center justify-center p-6 text-black text-center relative z-10">
      <PackageX size={64} className="mb-4 text-[#e53829]" />
      <h1 className="text-3xl font-fantapop uppercase mb-2">¡Premios Agotados!</h1>
      <p className="opacity-90 max-w-sm">
        Lo sentimos, todos los premios asignados a esta tienda ya han sido entregados.
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#ffd602]">
      <main className="min-h-screen relative z-10 flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-black/30 overflow-hidden">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={success ? "success" : "form"}
            variants={carouselVariant}
            initial="hidden" animate="visible" exit="exit"
            className="w-full max-w-md bg-transparent rounded-[3rem] p-3 sm:p-10 flex flex-col items-center"
          >
            {!success ? (
              <>
                <StoreHeader storeId={storeId} />
                
                {/* Mensaje de Error si falla la conexión */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-3 px-5 bg-white text-black text-sm font-bold rounded-full shadow-xl mb-6 border border-zinc-200"
                    >
                      <AlertCircle className="text-[#e53829] shrink-0" size={18} />
                      <span className="leading-tight">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* BOTÓN JUGAR GIGANTE */}
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}   
                  onClick={handlePlay}
                  disabled={loading}
                  // Usamos el azul #2c4896 que combinaba bien con el amarillo
                  className="w-60 sm:w-auto px-20 py-3 sm:py-6 bg-[#2c4896] text-white rounded-full font-fantapop text-5xl sm:text-5xl shadow-[0_10px_30px_rgba(44,72,150,0.4)] disabled:opacity-60 disabled:cursor-not-allowed uppercase transition-all flex items-center justify-center mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mx-auto w-10 h-10" />
                  ) : (
                    <span className="inline-block  font-arpona-bold">
                      JUGAR
                    </span>
                  )}
                </motion.button>
              </>
            ) : (
              <SuccessView prize={success} storeName={storeName} /> 
            )}
          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  )
}