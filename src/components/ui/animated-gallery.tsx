"use client" 

import * as React from "react"

import {
  HTMLMotionProps,
  MotionValue,
  Variants,
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react"

import { cn } from "@/lib/utils"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

interface ContainerScrollContextValue {
  scrollYProgress: MotionValue<number>
}

const SPRING_CONFIG = {
  type: "spring" as const,
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
}
const blurVariants: Variants = {
  hidden: {
    filter: "blur(10px)",
    opacity: 0,
  },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
  },
}

const ContainerScrollContext = React.createContext<
  ContainerScrollContextValue | undefined
>(undefined)
function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext)
  if (!context) {
    throw new Error(
      "useContainerScrollContext must be used within a ContainerScroll Component"
    )
  }
  return context
}
export const ContainerScroll = ({
  children,
  className,
  style,
  ...props
}: React.HtmlHTMLAttributes<HTMLDivElement>) => {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const disablePerspective = isMobile || Boolean(shouldReduceMotion)

  const { scrollYProgress: rawProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  })

  // Responsive spring: high stiffness (280) and low mass (0.1) responds instantaneously
  // to wheel scroll without lag, while eliminating mouse-wheel notch stepping into silky motion.
  const scrollYProgress = useSpring(rawProgress, {
    stiffness: 280,
    damping: 30,
    mass: 0.1,
    restDelta: 0.0001,
  })

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn("relative min-h-[120vh]", className)}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  )
}
ContainerScroll.displayName = "ContainerScroll"
export const ContainerSticky = ({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const disablePerspective = isMobile || Boolean(shouldReduceMotion)

  return (
    <div
      className={cn(
        "sticky left-0 top-0 min-h-[30rem] w-full overflow-hidden",
        className
      )}
      style={{
        perspective: disablePerspective ? "none" : "1200px",
        perspectiveOrigin: "center top",
        transformStyle: disablePerspective ? "flat" : "preserve-3d",
        ...style,
      }}
      {...props}
    />
  )
}
ContainerSticky.displayName = "ContainerSticky"

export const GalleryContainer = ({
  children,
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & HTMLMotionProps<"div">) => {
  const { scrollYProgress } = useContainerScrollContext()
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const disableTilt = isMobile || Boolean(shouldReduceMotion)

  // Un-tilts smoothly in the first 25% of scroll runway on desktop
  const rotateXTransform = useTransform(scrollYProgress, [0, 0.25], [26, 0])
  const scaleTransform = useTransform(scrollYProgress, [0, 0.35], [1.06, 1])

  return (
    <motion.div
      className={cn(
        "relative grid w-full grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5",
        isMobile ? "h-full" : "h-[175vh]",
        className
      )}
      style={{
        rotateX: disableTilt ? 0 : rotateXTransform,
        scale: disableTilt ? 1 : scaleTransform,
        transformOrigin: "center top",
        transformStyle: disableTilt ? "flat" : "preserve-3d",
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
GalleryContainer.displayName = "GalleryContainer"

export const GalleryCol = ({
  className,
  style,
  yRange = ["0%", "-10%"],
  ...props
}: HTMLMotionProps<"div"> & { yRange?: string[] }) => {
  const { scrollYProgress } = useContainerScrollContext()
  const shouldReduceMotion = useReducedMotion()

  // Start vertical motion early ([0.05, 1]) so images immediately respond to scroll
  const yTransform = useTransform(scrollYProgress, [0.05, 1], yRange)

  return (
    <motion.div
      className={cn("relative flex w-full flex-col gap-2", className)}
      style={{
        y: shouldReduceMotion ? "0%" : yTransform,
        ...style,
      }}
      {...props}
    />
  )
}
GalleryCol.displayName = "GalleryCol"

export const ContainerStagger = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, viewport, transition, ...props }, ref) => {
  return (
    <motion.div
      className={cn("relative", className)}
      ref={ref}
      initial="hidden"
      whileInView={"visible"}
      viewport={{ once: true || viewport?.once, ...viewport }}
      transition={{
        staggerChildren: transition?.staggerChildren || 0.2,
        ...transition,
      }}
      {...props}
    />
  )
})
ContainerStagger.displayName = "ContainerStagger"

export const ContainerAnimated = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div">
>(({ className, transition, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={blurVariants}
      transition={SPRING_CONFIG || transition}
      {...props}
    />
  )
})
ContainerAnimated.displayName = "ContainerAnimated"

export default ContainerScroll
