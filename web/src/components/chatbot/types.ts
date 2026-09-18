export interface ChatOption {
  label: string
  action: string
}

export interface ChatMessage {
  id: string
  from: 'bot' | 'user'
  text: string
  options?: ChatOption[]
}

export type ChatScreen =
  | 'menu'
  | 'shop-categories'
  | 'shop-items'
  | 'shop-item-detail'
  | 'support-menu'
  | 'support-order-lookup'
  | 'support-contact-form'
