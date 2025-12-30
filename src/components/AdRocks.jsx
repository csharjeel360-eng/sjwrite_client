import { useEffect, useState, useRef } from 'react'

export default function AdRocks({
  publisher = 'eyJpdiI6Ii8xN282dlpEWHlsdk5SeGdkeUY0Wnc9PSIsInZhbHVlIjoiUkd6ZXFrd3czOUs3MC9GU0NlWncxZz09IiwibWFjIjoiNzk2NzhkN2NlY2ZiZWQ2YmIxZjI0NmNjNDg1ZWEyYTRhN2IyYjIwNTIxYzFlNTI5MDMzZmJlOWVhOGU1ODRlNCJ9',
  adsize = '300x250', // Changed from '1830x854' to standard ad size
  scriptSrc = 'https://www.adsrock.online/assets/ads/ad.js',
  cardSize = 'normal',
}) {
  const [adLoaded, setAdLoaded] = useState(false)
  const [adError, setAdError] = useState(false)
  const adContainerRef = useRef(null)

  const sizeMap = {
    large: '728x90',
    medium: '300x250',
    small: '300x100',
    normal: '300x250',
  }

  const computedAdSize = sizeMap[cardSize] || adsize

  useEffect(() => {
    // Generate a unique ID for this ad container
    const adId = `ad-container-${Math.random().toString(36).substr(2, 9)}`
    
    // Create the ad container if it doesn't exist
    if (!adContainerRef.current) {
      const container = document.createElement('div')
      container.id = adId
      container.className = 'MainAdverTiseMentDiv'
      container.setAttribute('data-publisher', publisher)
      container.setAttribute('data-adsize', computedAdSize)
      container.setAttribute('style', 'position:relative; z-index: 0; display:inline-block;')
      
      // Add loading placeholder
      const placeholder = document.createElement('div')
      placeholder.style.cssText = `
        width: ${computedAdSize.split('x')[0]}px;
        height: ${computedAdSize.split('x')[1]}px;
        background: #f9f9f9;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 14px;
      `
      placeholder.textContent = 'Loading advertisement...'
      container.appendChild(placeholder)
      
      adContainerRef.current = container
    }

    // Function to load the ad script
    const loadAdScript = () => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${scriptSrc}"]`)
      
      if (!existingScript) {
        const script = document.createElement('script')
        script.src = scriptSrc
        script.className = 'adScriptClass'
        script.async = true
        
        script.onload = () => {
          console.log('✅ Ad script loaded successfully')
          // The external ad.js will handle ad loading via window.onload
          // It will find our MainAdverTiseMentDiv containers and populate them
          setAdLoaded(true)
        }
        
        script.onerror = (error) => {
          console.error('❌ Failed to load ad script:', error)
          setAdError(true)
        }
        
        document.body.appendChild(script)
      } else {
        // Script already loaded, trigger manual check
        console.log('ℹ️ Ad script already loaded')
        setTimeout(() => {
          checkIfAdLoaded()
        }, 1000)
      }
    }

    // Function to check if ad has loaded
    const checkIfAdLoaded = () => {
      if (adContainerRef.current && adContainerRef.current.innerHTML) {
        const content = adContainerRef.current.innerHTML.trim()
        if (content && !content.includes('Loading advertisement')) {
          setAdLoaded(true)
        }
      }
    }

    // Initial setup
    if (!document.querySelector(`#${adId}`)) {
      // Find where to insert the ad (or use a fixed position)
      const adSpot = document.querySelector('.ad-spot') || document.body
      adSpot.appendChild(adContainerRef.current)
      
      // Load the ad script
      loadAdScript()
      
      // Set up periodic check for ad loading
      const checkInterval = setInterval(checkIfAdLoaded, 500)
      
      // Clear interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!adLoaded) {
          console.warn('Ad loading timed out')
          setAdError(true)
        }
      }, 10000)

      return () => {
        clearInterval(checkInterval)
        // Clean up ad container when component unmounts
        if (adContainerRef.current && adContainerRef.current.parentNode) {
          adContainerRef.current.parentNode.removeChild(adContainerRef.current)
        }
      }
    }
  }, [publisher, computedAdSize, scriptSrc])

  // If error, show fallback
  if (adError) {
    return (
      <div 
        className="ad-fallback" 
        style={{
          width: computedAdSize.split('x')[0] + 'px',
          height: computedAdSize.split('x')[1] + 'px',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
          border: '2px dashed #ccc',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Advertisement
        </div>
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
          Ad space available
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '6px 12px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          Refresh Ad
        </button>
      </div>
    )
  }

  // Return empty div - the actual ad is inserted by the external script
  return (
    <div 
      className="ad-placeholder"
      style={{
        width: computedAdSize.split('x')[0] + 'px',
        height: computedAdSize.split('x')[1] + 'px',
        display: 'inline-block'
      }}
    >
      {/* The actual ad container is inserted by the script */}
      {!adLoaded && (
        <div 
          style={{
            width: '100%',
            height: '100%',
            background: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
            borderRadius: '4px'
          }}
        >
          Loading ad...
        </div>
      )}
    </div>
  )
}