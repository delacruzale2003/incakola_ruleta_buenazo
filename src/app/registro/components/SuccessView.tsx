'use client'

import { useEffect } from 'react'
import { Gift, ArrowLeft } from 'lucide-react' // NUEVO: Importamos ArrowLeft
import { motion, Variants } from 'framer-motion'

// Animación para el contenedor principal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

// Animación suave de subida
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
}

interface SuccessViewProps {
  prize: {
    id: string
    name: string
    image_url?: string | null
  }
  storeName: string
}

export default function SuccessView({ prize, storeName }: SuccessViewProps) {
  
  // Manejo del botón "Atrás" del celular
  useEffect(() => {
    // Agregamos un estado falso al historial
    window.history.pushState(null, '', window.location.href)
    
    // Si el usuario intenta ir hacia atrás (popstate), recargamos la página limpia
    const handlePopState = () => {
      window.location.reload()
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center w-full max-w-md mx-auto min-h-[70vh]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. Logo */}
      <motion.img 
        variants={itemVariants}
        src="/logoik.png" 
        alt="logoik" 
        className="w-64 sm:w-64 h-auto object-contain mb-8"
      />

      {/* 2. IMAGEN DEL PREMIO (Gigante) */}
      <motion.div 
        variants={itemVariants}
        className="relative w-80 h-80 sm:w-96 sm:h-96 mb-5 flex items-center justify-center"
      >
        {prize?.image_url ? (
          <img 
            src={prize.image_url} 
            alt={prize.name} 
            className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)]"
          />
        ) : (
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
            <Gift size={100} className="text-white" strokeWidth={1} />
          </div>
        )}
      </motion.div>

      {/* 3. Textos e instrucciones */}
      <motion.div variants={itemVariants} className="space-y-1 w-full px-4 flex flex-col items-center">
        <p className="text-[#1c3f8c] text-base sm:text-lg font-unity-headline leading-none">
          Acércate al promotor y <br/> reclama tu premio
        </p>
        <br />
        <br />
        <p className='font-arpona-bold text-[#1c3f8c] leading-tight'>BUENAZO FEST <br />2026</p>
        
        {/* NUEVO: Botón "Volver a participar" */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 mt-8 mb-2 text-[#1c3f8c] opacity-90 hover:opacity-100 transition-opacity"
        >
          
          <span className=" flex font-arpona-bold text-sm sm:text-base text-white uppercase tracking-wider translate-y-[2px] bg-[#1c3f8c] px-3 py-2 rounded-full">
            <ArrowLeft size={20} strokeWidth={2.5} />Volver a participar
          </span>
        </motion.button>

        {/* Nombre de la tienda como etiqueta discreta */}
        <div className="inline-block bg-black/10 text-black/60 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-2">
           {storeName}
        </div>
      </motion.div>

    </motion.div>
  )
}