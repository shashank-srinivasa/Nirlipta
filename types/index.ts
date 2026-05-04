export interface Class {
  id: string
  title: string
  description: string | null
  instructor: string
  duration_minutes: number
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  price: number
  max_students: number
  schedule_day: string | null
  schedule_time: string | null
  image_url: string | null
  is_active: boolean
  category: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  class_id: string
  student_name: string
  student_email: string
  student_phone: string
  booking_date: string
  amount_paid: number
  payment_id: string | null
  razorpay_order_id: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  created_at: string
  classes?: Class
}

export interface GalleryImage {
  id: string
  image_url: string
  caption: string | null
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface StudioSettings {
  id: number
  studio_name: string
  tagline: string
  about_text: string | null
  teacher_name: string | null
  teacher_photo_url: string | null
  footer_tagline: string | null
  about_heading: string | null
  about_heading_sub: string | null
  years_experience: string | null
  students_taught: string | null
  certification: string | null
  specialisations: string | null
  classes_page_subtitle: string | null
  blog_page_subtitle: string | null
  address: string | null
  phone: string | null
  whatsapp_number: string | null
  email: string | null
  instagram_url: string | null
  facebook_url: string | null
  youtube_url: string | null
  hero_image_url: string | null
  razorpay_key_id: string | null
  razorpay_key_secret: string | null
  payment_mode: 'whatsapp' | 'razorpay' | 'both'
  updated_at: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  bg_color: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
}
