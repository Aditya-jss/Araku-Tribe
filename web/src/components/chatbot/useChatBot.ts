import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as cartApi from '../../api/cartApi'
import { ApiError } from '../../api/client'
import * as contactApi from '../../api/contactApi'
import * as ordersApi from '../../api/ordersApi'
import * as productsApi from '../../api/productsApi'
import type { Category } from '../../api/productsApi'
import { useAuth } from '../../context/AuthContext'
import type { ChatMessage, ChatOption, ChatScreen } from './types'

const STORAGE_KEY = 'arakutribe_chat_transcript'
const TYPING_DELAY_MS = 350

const CATEGORY_LABELS: Record<Category, string> = {
  bag: 'Coffee Bags',
  cup: 'Coffee Cups',
  mug: 'Coffee Mugs',
  tshirt: 'T-Shirts',
}

function menuMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    from: 'bot',
    text: "Hi! I'm the Araku Tribe assistant. How can I help you today?",
    options: [
      { label: 'Shop for Products', action: 'shop:start' },
      { label: 'Customer Support', action: 'support:start' },
    ],
  }
}

function loadTranscript(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [menuMessage()]
    const parsed = JSON.parse(raw) as ChatMessage[]
    return parsed.length > 0 ? parsed : [menuMessage()]
  } catch {
    return [menuMessage()]
  }
}

export function useChatBot() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [messages, setMessages] = useState<ChatMessage[]>(loadTranscript)
  const [screen, setScreen] = useState<ChatScreen>('menu')
  const [typing, setTyping] = useState(false)
  const [awaitingInput, setAwaitingInput] = useState<'orderId' | 'supportMessage' | null>(null)

  const category = useRef<Category | null>(null)
  const page = useRef(1)
  const selectedProduct = useRef<productsApi.Product | null>(null)
  const supportIntent = useRef<'status' | 'cancel' | 'returns' | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages])

  const say = useCallback((text: string, options?: ChatOption[]) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: 'bot', text, options }])
    }, TYPING_DELAY_MS)
  }, [])

  const sayUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: 'user', text }])
  }, [])

  const requireAuth = useCallback(
    (thenLabel: string) => {
      say(`You'll need to sign in first to ${thenLabel}.`, [
        { label: 'Sign In', action: 'nav:login' },
        { label: 'Back to Menu', action: 'menu:show' },
      ])
    },
    [say],
  )

  const showCategories = useCallback(() => {
    setScreen('shop-categories')
    say(
      'Great! What would you like to browse?',
      Object.entries(CATEGORY_LABELS)
        .map(([value, label]) => ({ label, action: `shop:category:${value}` }))
        .concat([{ label: '← Back to Menu', action: 'menu:show' }]),
    )
  }, [say])

  const showItems = useCallback(
    async (cat: Category, pageNum: number) => {
      setScreen('shop-items')
      category.current = cat
      page.current = pageNum
      try {
        const res = await productsApi.listProducts({ category: cat, page: pageNum })
        if (res.products.length === 0) {
          say(`No products found in ${CATEGORY_LABELS[cat]} right now.`, [
            { label: '← Back to Categories', action: 'shop:start' },
          ])
          return
        }
        const lines = res.products.map((p) => `• ${p.name} — $${p.price.toFixed(2)}`).join('\n')
        const options: ChatOption[] = res.products.map((p) => ({
          label: p.name,
          action: `shop:item:${p.product_id}`,
        }))
        if (res.total_pages > pageNum) options.push({ label: 'Next Page →', action: `shop:page:${pageNum + 1}` })
        options.push({ label: '← Back to Categories', action: 'shop:start' })
        say(`Here's what we have in ${CATEGORY_LABELS[cat]}:\n${lines}`, options)
      } catch {
        say('Sorry, I could not load products right now.', [{ label: '← Back to Menu', action: 'menu:show' }])
      }
    },
    [say],
  )

  const showItemDetail = useCallback(
    async (productId: string) => {
      setScreen('shop-item-detail')
      try {
        const res = await productsApi.getProduct(productId)
        selectedProduct.current = res.product
        const p = res.product
        const options: ChatOption[] = []
        if (p.quantity >= p.min_order_quantity) {
          options.push({ label: `Add ${p.min_order_quantity} to Cart`, action: `shop:add:${p.min_order_quantity}` })
          const doubleQty = p.min_order_quantity * 2
          if (p.quantity >= doubleQty) {
            options.push({ label: `Add ${doubleQty} to Cart`, action: `shop:add:${doubleQty}` })
          }
        }
        options.push({ label: '← Back', action: `shop:category:${p.category}` })
        say(
          `${p.name}\n$${p.price.toFixed(2)} — ${p.quantity > 0 ? `${p.quantity} in stock` : 'Out of stock'}`,
          options,
        )
      } catch {
        say('Sorry, I could not load that product.', [{ label: '← Back to Menu', action: 'menu:show' }])
      }
    },
    [say],
  )

  const addToCart = useCallback(
    async (quantity: number) => {
      const product = selectedProduct.current
      if (!product) return
      try {
        await cartApi.addToCart(product.product_id, quantity)
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        say(`Added ${quantity} × ${product.name} to your cart!`, [
          { label: 'Proceed to Checkout', action: 'nav:checkout' },
          { label: 'Continue Shopping', action: 'shop:start' },
          { label: 'Back to Menu', action: 'menu:show' },
        ])
      } catch (err) {
        say(err instanceof ApiError ? err.message : 'Could not add that to your cart.', [
          { label: '← Back to Menu', action: 'menu:show' },
        ])
      }
    },
    [say, queryClient],
  )

  const showSupportMenu = useCallback(() => {
    setScreen('support-menu')
    say('What do you need help with?', [
      { label: 'Order Status / Tracking', action: 'support:status' },
      { label: 'Cancel an Order', action: 'support:cancel' },
      { label: 'Returns / Refunds', action: 'support:returns' },
      { label: 'Payment Issue', action: 'support:payment' },
      { label: 'Product Question', action: 'support:product' },
      { label: 'Something Else', action: 'support:other' },
      { label: '← Back to Menu', action: 'menu:show' },
    ])
  }, [say])

  const askOrderId = useCallback(
    (intent: 'status' | 'cancel' | 'returns') => {
      supportIntent.current = intent
      setScreen('support-order-lookup')
      setAwaitingInput('orderId')
      say("What's your order ID? (You can find this on your Orders page.)")
    },
    [say],
  )

  const lookupOrder = useCallback(
    async (orderIdText: string) => {
      const orderId = Number(orderIdText.replace(/\D/g, ''))
      if (!orderId) {
        say('That doesn\'t look like a valid order ID — numbers only, please.')
        return
      }
      try {
        const res = await ordersApi.getOrder(orderId)
        const order = res.order
        const itemLines = order.items.map((i) => `• ${i.product_name} × ${i.quantity}`).join('\n')
        const summary = `Order #${order.order_id}\nStatus: ${order.order_status}\nPayment: ${order.payment_status}\nTotal: $${order.total_amount.toFixed(2)}\n${itemLines}`

        if (supportIntent.current === 'cancel') {
          const cancellable = ['Processing', 'Pending'].includes(order.order_status)
          if (cancellable) {
            say(`${summary}\n\nThis order can still be cancelled.`, [
              { label: 'Cancel This Order', action: `support:do-cancel:${order.order_id}` },
              { label: '← Back to Menu', action: 'menu:show' },
            ])
          } else {
            say(`${summary}\n\nThis order can no longer be cancelled (status: ${order.order_status}).`, [
              { label: '← Back to Menu', action: 'menu:show' },
            ])
          }
        } else if (supportIntent.current === 'returns') {
          const eligible = order.order_status === 'Delivered'
          say(
            `${summary}\n\n${eligible ? 'This order is eligible for a return within 7 days of delivery.' : 'Returns are only available for delivered orders.'}`,
            [
              { label: 'Contact Support', action: 'support:other' },
              { label: '← Back to Menu', action: 'menu:show' },
            ],
          )
        } else {
          say(summary, [{ label: '← Back to Menu', action: 'menu:show' }])
        }
      } catch (err) {
        say(err instanceof ApiError ? err.message : "I couldn't find that order on your account.", [
          { label: '← Back to Menu', action: 'menu:show' },
        ])
      } finally {
        setAwaitingInput(null)
      }
    },
    [say],
  )

  const doCancelOrder = useCallback(
    async (orderId: number) => {
      try {
        await ordersApi.cancelOrder(orderId)
        say(`Order #${orderId} has been cancelled.`, [{ label: '← Back to Menu', action: 'menu:show' }])
      } catch (err) {
        say(err instanceof ApiError ? err.message : 'Could not cancel that order.', [
          { label: '← Back to Menu', action: 'menu:show' },
        ])
      }
    },
    [say],
  )

  const cannedAnswer = useCallback(
    (topic: 'payment' | 'product') => {
      const text =
        topic === 'payment'
          ? "If a payment didn't go through, it usually resolves within a few minutes. If you were charged but don't see your order, please contact support with your payment reference."
          : "For product details — ingredients, roast level, or brewing recommendations — check the product page, or contact support and we'll get you an answer."
      say(text, [
        { label: 'Contact Support', action: 'support:other' },
        { label: '← Back to Menu', action: 'menu:show' },
      ])
    },
    [say],
  )

  const askSupportMessage = useCallback(() => {
    if (!isAuthenticated) {
      say('Please sign in, or use our Contact page, so we can get back to you.', [
        { label: 'Sign In', action: 'nav:login' },
        { label: 'Go to Contact Page', action: 'nav:contact' },
        { label: '← Back to Menu', action: 'menu:show' },
      ])
      return
    }
    setScreen('support-contact-form')
    setAwaitingInput('supportMessage')
    say('What would you like to tell us? Type your message below.')
  }, [say, isAuthenticated])

  const submitSupportMessage = useCallback(
    async (text: string) => {
      if (!user) return
      try {
        await contactApi.sendContactMessage({
          name: `${user.firstname} ${user.lastname}`,
          email: user.email,
          phone: user.phonenumber,
          subject: 'Chat support request',
          message: text,
        })
        say("Thanks — we've received your message and will get back to you soon.", [
          { label: '← Back to Menu', action: 'menu:show' },
        ])
      } catch (err) {
        say(err instanceof ApiError ? err.message : 'Could not send your message.', [
          { label: '← Back to Menu', action: 'menu:show' },
        ])
      } finally {
        setAwaitingInput(null)
      }
    },
    [say, user],
  )

  const handleOption = useCallback(
    (option: ChatOption) => {
      sayUser(option.label)
      const [ns, verb, arg] = option.action.split(':')

      if (option.action === 'menu:show') {
        setScreen('menu')
        say(menuMessage().text, menuMessage().options)
        return
      }
      if (option.action === 'nav:login') {
        navigate('/login')
        return
      }
      if (option.action === 'nav:checkout') {
        navigate('/checkout')
        return
      }
      if (option.action === 'nav:contact') {
        navigate('/contact')
        return
      }

      if (ns === 'shop') {
        if (!isAuthenticated) {
          requireAuth('shop via chat')
          return
        }
        if (verb === 'start') showCategories()
        else if (verb === 'category') showItems(arg as Category, 1)
        else if (verb === 'page') showItems(category.current!, Number(arg))
        else if (verb === 'item') showItemDetail(arg)
        else if (verb === 'add') addToCart(Number(arg))
        return
      }

      if (ns === 'support') {
        if (verb === 'start') {
          showSupportMenu()
        } else if (verb === 'status' || verb === 'cancel' || verb === 'returns') {
          if (!isAuthenticated) requireAuth('look up an order')
          else askOrderId(verb)
        } else if (verb === 'payment' || verb === 'product') {
          cannedAnswer(verb)
        } else if (verb === 'other') {
          askSupportMessage()
        } else if (verb === 'do-cancel') {
          doCancelOrder(Number(arg))
        }
      }
    },
    [
      sayUser,
      say,
      navigate,
      isAuthenticated,
      requireAuth,
      showCategories,
      showItems,
      showItemDetail,
      addToCart,
      showSupportMenu,
      askOrderId,
      cannedAnswer,
      askSupportMessage,
      doCancelOrder,
    ],
  )

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!text.trim()) return
      sayUser(text)
      if (awaitingInput === 'orderId') lookupOrder(text)
      else if (awaitingInput === 'supportMessage') submitSupportMessage(text)
    },
    [awaitingInput, sayUser, lookupOrder, submitSupportMessage],
  )

  const reset = useCallback(() => {
    const initial = [menuMessage()]
    setMessages(initial)
    setScreen('menu')
    setAwaitingInput(null)
  }, [])

  return { messages, typing, screen, awaitingInput, handleOption, handleTextSubmit, reset }
}
