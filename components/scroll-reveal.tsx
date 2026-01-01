'use client'

import { useEffect } from 'react'

export function ScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))

    if (prefersReducedMotion) {
      reveals.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const observed = new WeakSet<Element>()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        }
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )

    const observe = (el: Element) => {
      if (observed.has(el)) return
      observed.add(el)
      io.observe(el)
    }

    reveals.forEach(observe)

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          if (node.classList.contains('reveal')) observe(node)
          node.querySelectorAll?.('.reveal').forEach(observe)
        })
      }
    })

    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return null
}


