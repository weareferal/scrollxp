import { IScene, SceneEventVars } from "./scene"

export interface Descriptor {
  name?: string
}

export interface AnimationDescriptor extends Descriptor {
  duration: number
  repeat: number
  yoyo: boolean
  transformOrigin: string
  from: StateProperty
  to: StateProperty
  delay: number
  ease: string
  momentum: number
  position: string
  stagger?: number
  label?: string
}

export interface SceneDescriptor extends Descriptor {
  enabled: boolean
  trigger?: HTMLElement
  duration: string | number | (() => number)
  hook: number
  reverse: boolean
  classToggle?: string
  pin?: boolean
  indicator?: string
  onEnter?: SceneDescriptorCallback
  onLeave?: SceneDescriptorCallback
  onProgress?: SceneDescriptorCallback
}

export interface ParallaxDescriptor extends Descriptor {
  enabled: boolean
  type: string
  speed: number
  momentum: number
  stagger?: number
  ease?: string
  element?: HTMLElement
  trigger?: HTMLElement
  duration?: string | number | (() => number)
  hook?: number
  offset?: number
  indicator?: string
}

export interface StateProperty {
  alpha?: number
  x?: number
  y?: number
  xPercent?: number
  yPercent?: number
  scale?: number
  rotation?: number
  width?: number
  height?: number
}

export interface DefaultDescriptors {
  animation?: AnimationDescriptor
  scene?: SceneDescriptor
  parallax?: ParallaxDescriptor
}

export interface SceneDescriptorCallback {
  (element: HTMLElement, scene: IScene, vars?: SceneEventVars): void
}
