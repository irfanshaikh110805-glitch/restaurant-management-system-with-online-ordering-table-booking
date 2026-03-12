/* eslint-disable no-console */
// Performance Monitoring Utilities
// Tracks animation frame rates and component render times

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: [],
      renderTimes: {},
      animationFrames: []
    }
    this.lastFrameTime = performance.now()
    this.frameCount = 0
    this.isMonitoring = false
  }

  // Start monitoring FPS
  startFPSMonitoring() {
    if (this.isMonitoring) return
    this.isMonitoring = true
    this.monitorFrame()
  }

  // Monitor individual animation frames
  monitorFrame() {
    if (!this.isMonitoring) return

    const currentTime = performance.now()
    const delta = currentTime - this.lastFrameTime
    const fps = 1000 / delta

    this.metrics.fps.push(fps)
    this.metrics.animationFrames.push(delta)
    
    // Keep only last 60 frames
    if (this.metrics.fps.length > 60) {
      this.metrics.fps.shift()
      this.metrics.animationFrames.shift()
    }

    this.lastFrameTime = currentTime
    this.frameCount++

    requestAnimationFrame(() => this.monitorFrame())
  }

  // Stop monitoring
  stopFPSMonitoring() {
    this.isMonitoring = false
  }

  // Get average FPS
  getAverageFPS() {
    if (this.metrics.fps.length === 0) return 0
    const sum = this.metrics.fps.reduce((a, b) => a + b, 0)
    return Math.round(sum / this.metrics.fps.length)
  }

  // Get minimum FPS (worst case)
  getMinFPS() {
    if (this.metrics.fps.length === 0) return 0
    return Math.round(Math.min(...this.metrics.fps))
  }

  // Get maximum FPS (best case)
  getMaxFPS() {
    if (this.metrics.fps.length === 0) return 0
    return Math.round(Math.max(...this.metrics.fps))
  }

  // Get average frame time in ms
  getAverageFrameTime() {
    if (this.metrics.animationFrames.length === 0) return 0
    const sum = this.metrics.animationFrames.reduce((a, b) => a + b, 0)
    return (sum / this.metrics.animationFrames.length).toFixed(2)
  }

  // Track component render time
  trackRenderTime(componentName, startTime) {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (!this.metrics.renderTimes[componentName]) {
      this.metrics.renderTimes[componentName] = []
    }

    this.metrics.renderTimes[componentName].push(renderTime)

    // Keep only last 10 renders
    if (this.metrics.renderTimes[componentName].length > 10) {
      this.metrics.renderTimes[componentName].shift()
    }
  }

  // Get average render time for a component
  getAverageRenderTime(componentName) {
    const times = this.metrics.renderTimes[componentName]
    if (!times || times.length === 0) return 0
    const sum = times.reduce((a, b) => a + b, 0)
    return (sum / times.length).toFixed(2)
  }

  // Get performance report
  getPerformanceReport() {
    return {
      fps: {
        average: this.getAverageFPS(),
        min: this.getMinFPS(),
        max: this.getMaxFPS()
      },
      frameTime: {
        average: this.getAverageFrameTime(),
        target: 16.67, // 60 FPS target
        status: this.getAverageFrameTime() < 16.67 ? 'GOOD' : 'NEEDS OPTIMIZATION'
      },
      components: Object.keys(this.metrics.renderTimes).map(name => ({
        name,
        averageRenderTime: this.getAverageRenderTime(name),
        status: this.getAverageRenderTime(name) < 100 ? 'GOOD' : 'SLOW'
      })),
      totalFrames: this.frameCount
    }
  }

  // Log performance report to console
  logReport() {
    const report = this.getPerformanceReport()
    console.group('🎯 Performance Report')
    console.log('FPS:', report.fps)
    console.log('Frame Time:', report.frameTime)
    console.log('Components:', report.components)
    console.log('Total Frames Monitored:', report.totalFrames)
    console.groupEnd()
    return report
  }

  // Reset all metrics
  reset() {
    this.metrics = {
      fps: [],
      renderTimes: {},
      animationFrames: []
    }
    this.frameCount = 0
  }

  // Check if animations are performing well
  isPerformanceGood() {
    const avgFPS = this.getAverageFPS()
    const avgFrameTime = parseFloat(this.getAverageFrameTime())
    return avgFPS >= 55 && avgFrameTime < 20 // Allow some margin
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor()

// React Hook for performance monitoring
export const usePerformanceMonitor = (componentName) => {
  const startTime = performance.now()

  return {
    trackRender: () => {
      performanceMonitor.trackRenderTime(componentName, startTime)
    },
    getMetrics: () => ({
      averageRenderTime: performanceMonitor.getAverageRenderTime(componentName),
      fps: performanceMonitor.getAverageFPS()
    })
  }
}

// Export singleton
export default performanceMonitor

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.startFPSMonitoring()
  
  // Log report every 10 seconds in development
  setInterval(() => {
    if (performanceMonitor.isMonitoring) {
      performanceMonitor.logReport()
    }
  }, 10000)
}
