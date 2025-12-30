import { useEffect, useState } from 'react'

export default function AdRocks({
  publisher = 'eyJpdiI6Ii8xN282dlpEWHlsdk5SeGdkeUY0Wnc9PSIsInZhbHVlIjoiUkd6ZXFrd3czOUs3MC9GU0NlWncxZz09IiwibWFjIjoiNzk2NzhkN2NlY2ZiZWQ2YmIxZjI0NmNjNDg1ZWEyYTRhN2IyYjIwNTIxYzFlNTI5MDMzZmJlOWVhOGU1ODRlNCJ9',
  adsize = '1830x854',
  scriptSrc = 'https://www.adsrock.online/assets/ads/ad.js',
  autoOpen = false,
  cardSize = 'normal',
}) {
  const [adHtml, setAdHtml] = useState('')
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(autoOpen)

  const sizeMap = {
    large: '1200x675',
    medium: '800x450',
    small: '600x320',
    normal: '800x450',
  }

  const heightClassMap = {
    large: 'h-96',
    medium: 'h-64',
    small: 'h-48',
    normal: 'h-56',
  }

  const computedAdSize = sizeMap[cardSize] || adsize
  const imageHeightClass = heightClassMap[cardSize] || 'h-56'

  useEffect(() => {
    const classNameScript = 'adScriptClass'
    let script = document.querySelector(`script.${classNameScript}[src="${scriptSrc}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = scriptSrc
      script.className = classNameScript
      script.async = true
      document.body.appendChild(script)
    }

    const initAds = async () => {
      const fetchWithRetries = async (url, opts = {}, retries = 2, baseDelay = 400) => {
        let lastErr = null
        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const res = await fetch(url, opts)
            if (res.ok) return res
            const errText = await res.text().catch(() => '')
            lastErr = new Error(`HTTP ${res.status} ${errText.slice(0, 200)}`)
          } catch (e) {
            lastErr = e
          }
          if (attempt < retries) {
            const wait = baseDelay * Math.pow(2, attempt)
            await new Promise((r) => setTimeout(r, wait))
          }
        }
        throw lastErr
      }
      try {
        const advertises = document.getElementsByClassName('MainAdverTiseMentDiv')
        const scripTags = document.getElementsByClassName(classNameScript)
        const scripturl = scripTags.length ? scripTags[0].getAttribute('src') : scriptSrc
        const siteurl = scripturl.replace('/assets/ads/ad.js', '')
        const currentUrl = window.location.hostname

        for (let inx = 0; inx < advertises.length; inx++) {
          const adElem = advertises[inx]
          adElem.setAttribute('style', 'position:relative; z-index: 0; display:inline-block;')

          const getAdSize = adElem.getAttribute('data-adsize') || computedAdSize
          const getPublisher = adElem.getAttribute('data-publisher') || publisher
          const AdUrl = siteurl + '/ads/' + getPublisher + '/' + getAdSize + '/' + currentUrl


          try {
            console.debug('AdRocks: fetching ad URL ->', AdUrl)
            const res = await fetchWithRetries(AdUrl, {}, 2, 500)
            const text = await res.text()
            adElem.innerHTML = text
            if (!adHtml) setAdHtml(text)
          } catch (err) {
            const msg = err && err.message ? err.message : String(err)
            console.error('Ad fetch final failure:', msg.slice ? msg.slice(0, 300) : msg)
            setFailed(true)
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    initAds()
    window.addEventListener('load', initAds)

    window.hideAdverTiseMent = function (elem) {
      try {
        if (elem && elem.parentElement) elem.parentElement.style.display = 'none'
      } catch (e) {
        console.error(e)
      }
      setVisible(false)
    }

    return () => {
      window.removeEventListener('load', initAds)
    }
  }, [adsize, publisher, scriptSrc])

  return (
    <>
      <div
        className="MainAdverTiseMentDiv"
        data-publisher={publisher}
        data-adsize={computedAdSize}
        style={{ display: 'inline-block' }}
      >
        <div className={`g1-frame-inner ${imageHeightClass} rounded-lg overflow-hidden`}>
          {adHtml ? (
            <div dangerouslySetInnerHTML={{ __html: adHtml }} />
          ) : failed ? (
            <div style={{ width: '100%', height: '100%', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              <div>Ad unavailable</div>
            </div>
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#f3f3f3' }} />
          )}
        </div>
      </div>

      {adHtml && (
        <>
          {visible ? (
            <div
              className="ar-modal-overlay"
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
              }}
              onClick={() => setVisible(false)}
            >
              <div
                className="ar-modal"
                style={{
                  position: 'relative',
                  maxWidth: '95%',
                  maxHeight: '95%',
                  overflow: 'auto',
                  background: '#fff',
                  borderRadius: 8,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  aria-label="Close ad"
                  onClick={() => setVisible(false)}
                  style={{ position: 'absolute', top: 8, right: 8, zIndex: 10000 }}
                >
                  ×
                </button>
                <div dangerouslySetInnerHTML={{ __html: adHtml }} />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
            >
              Show Ad
            </button>
          )}
        </>
      )}
    </>
  )
}
