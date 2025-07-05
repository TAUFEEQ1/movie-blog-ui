<template>
  <div class="movie-carousel relative">
    <Carousel
      :settings="settings"
      :breakpoints="breakpoints"
      :wrap-around="true"
      :autoplay="autoplay ? 4000 : 0"
      :pause-autoplay-on-hover="true"
      :touch-drag="true"
      :mouse-drag="true"
      :transition="500"
    >
      <Slide v-for="item in items" :key="`carousel-${item.tmdb_id}`">
        <div class="carousel-item p-2">
          <slot :item="item" name="item">
            <TrendingCard 
              :item="item" 
              @play-trailer="$emit('play-trailer', $event)"
              @add-to-wishlist="$emit('add-to-wishlist', $event)" 
            />
          </slot>
        </div>
      </Slide>

      <template #addons>
        <Navigation>
          <template #next>
            <button class="carousel-nav-btn next absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg">
              <Icon name="mdi:chevron-right" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </template>
          <template #prev>
            <button class="carousel-nav-btn prev absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg">
              <Icon name="mdi:chevron-left" class="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </template>
        </Navigation>
        <Pagination v-if="showDots" />
      </template>
    </Carousel>
  </div>
</template>

<script setup lang="ts">
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

// Define props
const props = defineProps({
  items: {
    type: Array as () => any[],
    required: true,
  },
  slidesPerView: {
    type: Number,
    default: 4,
  },
  showDots: {
    type: Boolean,
    default: false,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
  touchSensitivity: {
    type: Number,
    default: 10, // Default touch sensitivity threshold (lower = more sensitive)
  }
})

// Emit events
defineEmits(['play-trailer', 'add-to-wishlist'])

// Carousel settings
const settings = {
  itemsToShow: props.slidesPerView,
  snapAlign: 'start' as 'start',
  touchDrag: true,
  mouseDrag: true,
  draggable: true,
  swipeThreshold: props.touchSensitivity, // Configurable sensitivity
}

// Responsive breakpoints
const breakpoints = {
  // Mobile (phones)
  '640': {
    itemsToShow: 1,
    snapAlign: 'center' as 'center',
    touchDrag: true,
    mouseDrag: true,
    draggable: true,
    swipeThreshold: 5, // Even more sensitive on small screens
  },
  // Small tablets
  '768': {
    itemsToShow: 2,
    snapAlign: 'start' as 'start',
    touchDrag: true,
    mouseDrag: true,
  },
  // Large tablets & small desktops
  '1024': {
    itemsToShow: 3,
    snapAlign: 'start' as 'start',
  },
  // Large desktops
  '1280': {
    itemsToShow: props.slidesPerView,
    snapAlign: 'start' as 'start',
  },
}
</script>

<style scoped>
/* Custom carousel styling */
:deep(.carousel__track) {
  padding: 1rem 0;
}

:deep(.carousel__viewport) {
  overflow: visible;
}

.carousel-item {
  transition: all 0.3s ease;
  padding: 0.5rem;
}

/* Touch indicator for mobile */
@media (max-width: 768px) {
  .movie-carousel::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 4px;
    background-color: #e2e8f0;
    border-radius: 2px;
    opacity: 0.7;
  }
}

/* Customize the pagination dots */
:deep(.carousel__pagination) {
  margin-top: 1rem;
}

:deep(.carousel__pagination-button) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e2e8f0;
  margin: 0 4px;
}

:deep(.carousel__pagination-button--active) {
  background-color: #3b82f6;
  transform: scale(1.2);
}

/* Ensure navigation buttons appear on hover */
.carousel-nav-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
  transform: translateY(-50%) scale(0.9);
}

.movie-carousel:hover .carousel-nav-btn {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

/* Fix mobile navigation positioning and enhance touch experience */
@media (max-width: 768px) {
  .carousel-nav-btn.next {
    right: 0;
  }
  .carousel-nav-btn.prev {
    left: 0;
  }
  
  /* Make carousel area larger for better touch target */
  :deep(.carousel__slide) {
    touch-action: pan-y;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
  }
  
  .carousel-item {
    padding: 0.75rem;
  }
  
  /* Add visual feedback for touch */
  :deep(.carousel__track) {
    will-change: transform;
  }
}
</style>
