import { type NextRequest } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[stripe-webhook] Signature verification failed: ${message}`)
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  switch (event.type) {
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      const billingEventId = invoice.metadata?.billingEventId

      if (billingEventId) {
        await prisma.billingEvent.update({
          where: { id: billingEventId },
          data: { status: "paid" },
        })
        console.log(`[stripe-webhook] BillingEvent ${billingEventId} marked as paid`)
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice
      const billingEventId = invoice.metadata?.billingEventId

      if (billingEventId) {
        await prisma.billingEvent.update({
          where: { id: billingEventId },
          data: { status: "failed" },
        })
        console.error(`[stripe-webhook] BillingEvent ${billingEventId} payment failed`)
      }
      break
    }

    case "invoice.created":
    case "invoice.sent": {
      const invoice = event.data.object as Stripe.Invoice
      const billingEventId = invoice.metadata?.billingEventId

      if (billingEventId) {
        await prisma.billingEvent.update({
          where: { id: billingEventId },
          data: { status: "invoiced" },
        })
        console.log(`[stripe-webhook] BillingEvent ${billingEventId} status → invoiced (${event.type})`)
      }
      break
    }

    default:
      // Ignore unhandled event types
      break
  }

  return Response.json({ received: true })
}
