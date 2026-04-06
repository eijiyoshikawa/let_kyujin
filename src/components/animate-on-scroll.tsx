"use client"

import { useEffect, useRef } from "react"

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-up" | "slide-left" | "slide-right" | "scale" | "stagger"
  delay?: number
}

export function AnimateOnScroll({
  children,
  className = "",
  animation = "fade-up",
  delay,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible")
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const animClass = {
    "fade-up": "animate-on-scroll",
    "slide-left": "animate-slide-left",
    "slide-right": "animate-slide-right",
    scale: "animate-scale",
    stagger: "stagger-children",
  }[animation]

  const delayClass = delay ? `delay-${delay}` : ""

  return (
    <div ref={ref} className={`${animClass} ${delayClass} ${className}`}>
      {children}
    </div>
  )
}
