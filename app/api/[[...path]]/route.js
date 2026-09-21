import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createHmac, timingSafeEqual } from 'crypto'
import { MongoClient } from 'mongodb'
import nodemailer from 'nodemailer'

let clientPromise
const images = [
  'https://images.unsplash.com/photo-1759123136466-63b3c37db41f?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1767634854859-db8255389e64?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1780391592801-5e8867523492?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1589891685391-b37508e8df4c?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1531932594968-e5e5e9dee95a?auto=format&fit=crop&w=1400&q=85',
]
const locations = ['Nalagarh', 'Baddi', 'Solan', 'Shimla', 'Kasauli', 'Parwanoo', 'Dharamshala', 'Kangra', 'Palampur', 'Manali', 'Kullu', 'Mandi', 'Hamirpur', 'Bilaspur', 'Una', 'Chamba', 'Nahan', 'Narkanda']
const starterProperties = [
  { title: 'The Cedar House', location: 'Kasauli', price: '₹ 4.85 Cr', type: 'Villa', area: '3,200 sq. ft.', address: 'Manki Point Road, Kasauli, Himachal Pradesh', image: images[0], gallery: [images[0], images[1], images[2]], description: 'A considered mountain residence where warm cedar, generous glazing, and quiet outdoor spaces frame the best of Kasauli. Designed for slow weekends and effortless hosting.', amenities: ['Mountain views', 'Private garden', 'Fireplace lounge', 'Solar backup', 'Staff room'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '4.5' }, { label: 'Plot size', value: '8,900 sq. ft.' }, { label: 'Year built', value: '2023' }], nearby: ['Kasauli Club · 8 min', 'Lawrence School · 14 min', 'Kasauli Market · 10 min', 'Gilbert Trail · 12 min'], video: 'https://cdn.coverr.co/videos/coverr-aerial-view-of-the-mountains-1577/1080p.mp4' },
  { title: 'Pinecrest Estate', location: 'Shimla', price: '₹ 7.20 Cr', type: 'Estate', area: '5,850 sq. ft.', address: 'Mashobra Road, Shimla, Himachal Pradesh', image: images[1], gallery: [images[1], images[4], images[0]], description: 'A private estate above Shimla with layered lawns, forest-facing rooms, and a distinctly residential sense of arrival. A rare long-term base in the hills.', amenities: ['Forest outlook', 'Double-height living', 'Home office', 'Covered parking', 'Guest suite'], specs: [{ label: 'Bedrooms', value: '5' }, { label: 'Bathrooms', value: '5' }, { label: 'Plot size', value: '1.4 acres' }, { label: 'Year built', value: '2022' }], nearby: ['Theog Market · 16 min', 'Bishop Cotton School · 24 min', 'IGMC Shimla · 22 min', 'Craignano Nature Park · 8 min'] },
  { title: 'Valley Light Residence', location: 'Dharamshala', price: '₹ 3.40 Cr', type: 'Residence', area: '2,480 sq. ft.', address: 'Naddi Village, Dharamshala, Himachal Pradesh', image: images[3], gallery: [images[3], images[4], images[2]], description: 'A light-filled modern home with long valley views toward the Dhauladhar range. Natural materials and simple planning make every room feel connected to the landscape.', amenities: ['Dhauladhar views', 'Terrace garden', 'Library nook', 'Rainwater harvesting', 'Furnished'], specs: [{ label: 'Bedrooms', value: '3' }, { label: 'Bathrooms', value: '3' }, { label: 'Plot size', value: '5,200 sq. ft.' }, { label: 'Year built', value: '2024' }], nearby: ['Naddi Market · 5 min', 'Tibetan Children’s Village · 13 min', 'Zonal Hospital · 18 min', 'Dal Lake · 6 min'] },
  { title: 'Apple Orchard Retreat', location: 'Manali', price: '₹ 5.65 Cr', type: 'Farmhouse', area: '4,100 sq. ft.', address: 'Prini Village, Manali, Himachal Pradesh', image: images[4], gallery: [images[4], images[2], images[3]], description: 'A quiet orchard retreat near Manali, balancing alpine character with contemporary comfort. The landscape is the hero, with private corners for every season.', amenities: ['Apple orchard', 'Mountain deck', 'Caretaker cottage', 'Wood-fired sauna', 'River access'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '4' }, { label: 'Land', value: '1.1 acres' }, { label: 'Year built', value: '2021' }], nearby: ['Old Manali · 12 min', 'The Manali School · 9 min', 'Civil Hospital · 15 min', 'Hadimba Temple · 14 min'] },
  { title: 'The Green Valley Plot', location: 'Baddi', price: '₹ 1.18 Cr', type: 'Land', area: '12,500 sq. ft.', address: 'Bhatoli Kalan, Baddi, Himachal Pradesh', image: images[2], gallery: [images[2], images[3], images[1]], description: 'A well-positioned parcel in the Baddi–Nalagarh growth corridor, suited to a private residence, boutique retreat, or considered investment.', amenities: ['Road frontage', 'Clear title', 'Water connection', 'Electricity nearby', 'Flexible zoning'], specs: [{ label: 'Land area', value: '12,500 sq. ft.' }, { label: 'Road width', value: '30 ft.' }, { label: 'Slope', value: 'Gentle' }, { label: 'Title', value: 'Clear' }], nearby: ['Baddi Market · 9 min', 'Eicher School · 12 min', 'ESI Hospital · 15 min', 'Pinjore Gardens · 28 min'] },
  { title: 'Solan Courtyard Home', location: 'Solan', price: '₹ 2.75 Cr', type: 'Home', area: '2,900 sq. ft.', address: 'Chambaghat, Solan, Himachal Pradesh', image: images[0], gallery: [images[0], images[3], images[4]], description: 'A gracious courtyard home in Solan with a welcoming plan, excellent natural light, and room to grow into a family legacy.', amenities: ['Central courtyard', 'Modular kitchen', 'Study room', 'Garage', 'Solar water heater'], specs: [{ label: 'Bedrooms', value: '4' }, { label: 'Bathrooms', value: '3' }, { label: 'Plot size', value: '6,500 sq. ft.' }, { label: 'Year built', value: '2020' }], nearby: ['Solan Mall · 8 min', 'St. Luke’s School · 10 min', 'Regional Hospital · 11 min', 'Mohan Park · 6 min'] },
]

async function getDb() {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is not configured')
  if (!clientPromise) clientPromise = MongoClient.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 3000 })
  const client = await clientPromise
  return client.db(process.env.DB_NAME)
}

function serialize(property) {
  if (!property) return property
  const { _id, ...safe } = property
  return safe
}

function listingToProperty(listing) {
  return {
    id: listing.id,
    title: listing.title,
    location: listing.city || listing.district || 'Himachal Pradesh',
    price: listing.price,
    type: listing.category,
    area: [listing.area, listing.areaUnit].filter(Boolean).join(' '),
    address: [listing.locality, listing.city, listing.district, listing.state].filter(Boolean).join(', '),
    image: listing.image || (listing.photos || [])[0] || '',
    gallery: (listing.photos && listing.photos.length) ? listing.photos : (listing.image ? [listing.image] : []),
    description: listing.description || '',
    amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
    specs: [
      listing.bedrooms ? { label: 'Bedrooms', value: String(listing.bedrooms) } : null,
      listing.bathrooms ? { label: 'Bathrooms', value: String(listing.bathrooms) } : null,
      (listing.area) ? { label: 'Area', value: [listing.area, listing.areaUnit].filter(Boolean).join(' ') } : null,
      listing.propertyAge ? { label: 'Age', value: String(listing.propertyAge) } : null,
    ].filter(Boolean),
    nearby: listing.landmark ? [listing.landmark] : [],
    video: listing.video || '',
    mapsLink: listing.mapsLink || '',
    listingType: listing.listingType || '',
    negotiable: !!listing.negotiable,
    featured: !!listing.featured,
    verified: !!listing.verified,
    sourceListingId: listing.listingId,
    status: 'published',
    createdAt: listing.createdAt || new Date().toISOString(),
  }
}

async function ensureSeed(db) {
  const collection = db.collection('properties')
  if (await collection.countDocuments() === 0) {
    await collection.insertMany(starterProperties.map((property) => ({ ...property, id: randomUUID(), status: 'published', createdAt: new Date().toISOString() })))
  }
}

const fallbackProperties = starterProperties.map((property, index) => ({
  ...property,
  id: `starter-${index + 1}`,
  status: 'published',
  createdAt: new Date().toISOString(),
}))
const fallbackInquiries = []
const fallbackMessages = []

function response(data, status = 200) { return NextResponse.json(data, { status }) }

const adminEmail = () => String(process.env.ADMIN_USERNAME || '').trim().toLowerCase()
const adminPassword = () => String(process.env.ADMIN_PASSWORD || '')
const adminSecret = () => process.env.ADMIN_SESSION_SECRET || adminPassword()
function adminToken() {
  const payload = Buffer.from(JSON.stringify({ email: adminEmail(), exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  const signature = createHmac('sha256', adminSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}
function isAdmin(request) {
  const token = request.cookies.get('himbhumi_admin')?.value || ''
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !adminSecret()) return false
  const expected = createHmac('sha256', adminSecret()).update(payload).digest('base64url')
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.email === adminEmail() && data.exp > Date.now()
  } catch { return false }
}
function requireAdmin(request) { return isAdmin(request) ? null : response({ error: 'Admin authentication required' }, 401) }

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()) }

const smtpConfigured = () => process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
const defaultAdminNotificationRecipients = [
  'Surajrana7339@gmail.com',
  'Surajrana2686@gmail.com',
  'Suraj.rana199902@gmail.com',
]
const adminNotificationRecipients = () => String(process.env.ADMIN_NOTIFICATION_EMAILS || defaultAdminNotificationRecipients.join(','))
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(isValidEmail)

let mailTransporter
function getTransporter() {
  if (!mailTransporter) {
    const port = Number(process.env.SMTP_PORT || 587)
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return mailTransporter
}

async function sendOtpEmail(to, code) {
  const from = process.env.SMTP_FROM || `HimBhumi Real Estates <${process.env.SMTP_USER}>`
  await getTransporter().sendMail({
    from,
    to,
    subject: `Your HimBhumi verification code: ${code}`,
    text: `Your HimBhumi verification code is ${code}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `<div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:24px;border:1px solid #dbe9e0;border-radius:16px">
      <h2 style="color:#0a4a20;margin:0 0 8px">HimBhumi Real Estates</h2>
      <p style="color:#444;font-size:14px">Use the code below to verify your email address and publish your property listing.</p>
      <p style="font-size:34px;letter-spacing:8px;font-weight:700;color:#0a4a20;margin:20px 0">${code}</p>
      <p style="color:#888;font-size:12px">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
    </div>`,
  })
}

async function sendMessageEmail(to, subject, text) {
  const from = process.env.SMTP_FROM || `HimBhumi Real Estates <${process.env.SMTP_USER}>`
  await getTransporter().sendMail({ from, to, subject, text })
}

async function notifyAdminRecipients(subject, text) {
  const recipients = adminNotificationRecipients()
  if (!smtpConfigured() || !recipients.length) return { sent: false, reason: 'SMTP notifications are not configured' }
  const from = process.env.SMTP_FROM || `HimBhumi Real Estates <${process.env.SMTP_USER}>`
  try {
    await getTransporter().sendMail({ from, to: recipients, subject, text })
    return { sent: true }
  } catch (error) {
    console.error('Admin notification email error:', error?.message || error)
    return { sent: false, reason: 'Notification delivery failed' }
  }
}

function inquiryNotification(inquiry) {
  return [
    'A new HimBhumi property enquiry was received.',
    '',
    `Name: ${inquiry.fullName}`,
    `Mobile: ${inquiry.mobile}`,
    `Email: ${inquiry.email || 'Not provided'}`,
    `Property: ${inquiry.propertyTitle || inquiry.propertyId}`,
    `Message: ${inquiry.message || 'No message provided.'}`,
  ].join('\n')
}

function messageNotification(message) {
  return [
    'A new HimBhumi message was created.',
    '',
    `Recipient: ${message.to}`,
    `Subject: ${message.subject}`,
    `Message: ${message.message}`,
  ].join('\n')
}

export async function GET(request, { params }) {
  try {
    const routeParams = await params
    const parts = routeParams?.path || []
    if (parts[0] === 'admin' && parts[1] === 'session') return isAdmin(request) ? response({ authenticated: true }) : response({ error: 'Not authenticated' }, 401)
    if ((parts[0] === 'inquiries' || parts[0] === 'listings' || parts[0] === 'messages') && !isAdmin(request)) return response({ error: 'Admin authentication required' }, 401)
    if (parts[0] === 'locations') return response({ locations })
    let db
    try {
      db = await getDb()
    } catch (databaseError) {
      if (parts[0] === 'properties') {
        const selected = new URL(request.url).searchParams.get('location')
        const results = selected && selected !== 'All locations'
          ? fallbackProperties.filter((property) => property.location === selected)
          : fallbackProperties
        if (parts[1]) {
          const property = fallbackProperties.find((item) => item.id === parts[1])
          return property ? response(property) : response({ error: 'Property not found' }, 404)
        }
        return response({ properties: results, locations, source: 'demo-catalog' })
      }
      if (parts[0] === 'inquiries') return response({ inquiries: fallbackInquiries, source: 'demo-catalog' })
      if (parts[0] === 'listings') return response({ listings: [], source: 'demo-catalog' })
      if (parts[0] === 'messages') return response({ messages: fallbackMessages, source: 'demo-catalog' })
      throw databaseError
    }
    if (parts[0] === 'properties') {
      await ensureSeed(db)
      if (parts[1]) {
        const property = await db.collection('properties').findOne({ id: parts[1] })
        return property ? response(serialize(property)) : response({ error: 'Property not found' }, 404)
      }
      const selected = new URL(request.url).searchParams.get('location')
      const query = selected && selected !== 'All locations' ? { location: selected } : {}
      const results = await db.collection('properties').find(query).sort({ createdAt: -1 }).toArray()
      return response({ properties: results.map(serialize), locations })
    }
    if (parts[0] === 'inquiries') {
      const inquiries = await db.collection('inquiries').find({}).sort({ createdAt: -1 }).toArray()
      return response({ inquiries: inquiries.map(serialize) })
    }
    if (parts[0] === 'messages') {
      const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).toArray()
      return response({ messages: messages.map(serialize) })
    }
    if (parts[0] === 'listings') {
      const url = new URL(request.url)
      const listingIdParam = url.searchParams.get('listingId')
      if (listingIdParam) {
        const found = await db.collection('listings').findOne({ listingId: listingIdParam.trim().toUpperCase() })
        if (!found) return response({ error: 'No listing found with that ID. Please check and try again.' }, 404)
        return response({ listing: { listingId: found.listingId, title: found.title, status: found.status || 'pending_review', verified: !!found.verified, featured: !!found.featured, category: found.category, listingType: found.listingType, price: found.price, city: found.city, district: found.district, image: found.image || (found.photos || [])[0] || '', propertyId: found.status === 'approved' ? found.id : null, createdAt: found.createdAt } })
      }
      if (parts[1]) {
        const listing = await db.collection('listings').findOne({ id: parts[1] })
        return listing ? response(serialize(listing)) : response({ error: 'Listing not found' }, 404)
      }
      const statusFilter = url.searchParams.get('status')
      const query = statusFilter ? { status: statusFilter } : {}
      const listings = await db.collection('listings').find(query).sort({ createdAt: -1 }).toArray()
      return response({ listings: listings.map(serialize) })
    }
    return response({ error: 'Route not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}

export async function POST(request, { params }) {
  try {
    const routeParams = await params
    const parts = routeParams?.path || []
    const body = await request.json()
    if (parts[0] === 'admin' && parts[1] === 'login') {
      if (!adminEmail() || !adminPassword()) return response({ error: 'Admin credentials are not configured' }, 503)
      if (String(body.email || '').trim().toLowerCase() !== adminEmail() || String(body.password || '') !== adminPassword()) return response({ error: 'Invalid admin credentials' }, 401)
      const result = response({ authenticated: true })
      result.cookies.set('himbhumi_admin', adminToken(), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 8 * 60 * 60, path: '/' })
      return result
    }
    if (parts[0] === 'admin' && parts[1] === 'logout') {
      const result = response({ authenticated: false })
      result.cookies.set('himbhumi_admin', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' })
      return result
    }
    if (parts[0] === 'properties') {
      const authError = requireAdmin(request)
      if (authError) return authError
    }
    const adminWrite = ['messages'].includes(parts[0]) || (parts[0] === 'inquiries' && parts[1])
    if (adminWrite) {
      const authError = requireAdmin(request)
      if (authError) return authError
    }
    let db
    try { db = await getDb() } catch (databaseError) {
      if (parts[0] === 'inquiries' && !parts[1]) {
        if (!body.fullName || !body.mobile || !body.propertyId) return response({ error: 'Name, mobile, and property are required' }, 400)
        const inquiry = { id: randomUUID(), ...body, createdAt: new Date().toISOString(), status: 'new' }
        fallbackInquiries.unshift(inquiry)
        const notification = await notifyAdminRecipients(`New property enquiry from ${inquiry.fullName}`, inquiryNotification(inquiry))
        return response({ inquiry, notification }, 201)
      }
      if (parts[0] === 'messages') {
        if (!body.to || !body.subject || !body.message) return response({ error: 'Recipient, subject, and message are required' }, 400)
        const message = { id: randomUUID(), to: String(body.to).trim(), subject: String(body.subject).trim(), message: String(body.message).trim(), enquiryId: body.enquiryId || null, status: 'stored', createdAt: new Date().toISOString() }
        fallbackMessages.unshift(message)
        const notification = await notifyAdminRecipients(`New HimBhumi message: ${message.subject}`, messageNotification(message))
        return response({ message, notification, source: 'demo-storage' }, 201)
      }
      throw databaseError
    }
    if (parts[0] === 'inquiries') {
      if (!body.fullName || !body.mobile || !body.propertyId) return response({ error: 'Name, mobile, and property are required' }, 400)
      const inquiry = { id: randomUUID(), ...body, createdAt: new Date().toISOString(), status: 'new' }
      await db.collection('inquiries').insertOne(inquiry)
      const notification = await notifyAdminRecipients(`New property enquiry from ${inquiry.fullName}`, inquiryNotification(inquiry))
      return response({ inquiry: serialize(inquiry), notification }, 201)
    }
    if (parts[0] === 'messages') {
      if (!body.to || !body.subject || !body.message) return response({ error: 'Recipient, subject, and message are required' }, 400)
      const message = { id: randomUUID(), to: String(body.to).trim(), subject: String(body.subject).trim(), message: String(body.message).trim(), enquiryId: body.enquiryId || null, status: 'stored', createdAt: new Date().toISOString() }
      if (smtpConfigured() && isValidEmail(message.to)) {
        try {
          await sendMessageEmail(message.to, message.subject, message.message)
          message.status = 'sent'
        } catch (error) {
          message.status = 'delivery_failed'
          message.deliveryError = error?.message || 'Email delivery failed'
        }
      }
      try {
        await db.collection('messages').insertOne(message)
      } catch (databaseError) {
        fallbackMessages.unshift(message)
        const notification = await notifyAdminRecipients(`New HimBhumi message: ${message.subject}`, messageNotification(message))
        return response({ message: serialize(message), notification, source: 'demo-storage' }, 201)
      }
      const notification = await notifyAdminRecipients(`New HimBhumi message: ${message.subject}`, messageNotification(message))
      return response({ message: serialize(message), notification }, 201)
    }
    if (parts[0] === 'properties') {
      if (!body.title || !body.location || !body.price) return response({ error: 'Title, location, and price are required' }, 400)
      const property = { id: randomUUID(), ...body, gallery: body.gallery || [body.image].filter(Boolean), createdAt: new Date().toISOString(), status: body.status || 'published' }
      await db.collection('properties').insertOne(property)
      return response({ property: serialize(property) }, 201)
    }
    if (parts[0] === 'listings' && parts[1] === 'verify') {
      // Email OTP via SMTP (Nodemailer). When SMTP_* env vars are set, a real email is sent;
      // otherwise the flow falls back to an on-screen demo OTP (devOtp) so it works without SMTP.
      const action = parts[2]
      const value = String(body.value || body.email || '').trim().toLowerCase()
      if (!isValidEmail(value)) return response({ error: 'Please enter a valid email address' }, 400)
      const key = `email:${value}`
      if (action === 'send') {
        const otp = String(Math.floor(100000 + Math.random() * 900000))
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
        if (smtpConfigured()) {
          try {
            await sendOtpEmail(value, otp)
            await db.collection('otps').updateOne({ key }, { $set: { key, channel: 'email', value, provider: 'smtp', otp, expiresAt, verified: false, createdAt: new Date().toISOString() } }, { upsert: true })
            return response({ sent: true, mocked: false })
          } catch (err) {
            // Graceful degradation: if the mail provider rejects the request (e.g. unauthorized IP
            // or unverified sender), keep the listing flow usable with an on-screen code.
            console.error('SMTP send error:', err?.message)
            await db.collection('otps').updateOne({ key }, { $set: { key, channel: 'email', value, provider: 'demo', otp, expiresAt, verified: false, createdAt: new Date().toISOString(), smtpError: err?.message || 'send failed' } }, { upsert: true })
            return response({ sent: true, devOtp: otp, mocked: true, notice: 'Email delivery is temporarily unavailable, so your code is shown on screen.' })
          }
        }
        await db.collection('otps').updateOne({ key }, { $set: { key, channel: 'email', value, provider: 'demo', otp, expiresAt, verified: false, createdAt: new Date().toISOString() } }, { upsert: true })
        return response({ sent: true, devOtp: otp, mocked: true })
      }
      if (action === 'check') {
        const entered = String(body.otp || '').trim()
        const record = await db.collection('otps').findOne({ key })
        if (!record) return response({ error: 'Please request a code first' }, 400)
        if (new Date(record.expiresAt) < new Date()) return response({ error: 'Code expired. Please request a new one.' }, 400)
        if (record.otp !== entered) return response({ error: 'Incorrect code. Please try again.' }, 400)
        await db.collection('otps').updateOne({ key }, { $set: { verified: true } })
        return response({ verified: true, channel: 'email' })
      }
      return response({ error: 'Unknown verification action' }, 404)
    }
    if (parts[0] === 'listings') {
      const required = ['title', 'category', 'listingType', 'price', 'contactName', 'email']
      const missing = required.filter((field) => !String(body[field] || '').trim())
      if (missing.length) return response({ error: `Please fill: ${missing.join(', ')}` }, 400)
      if (!isValidEmail(body.email)) return response({ error: 'A valid email address is required' }, 400)
      if (!body.emailVerified) return response({ error: 'Email verification is required before submitting' }, 400)
      if (!body.authorized) return response({ error: 'Please confirm you are authorized to advertise this property' }, 400)
      const listingId = `HB-${randomUUID().slice(0, 6).toUpperCase()}`
      const listing = {
        id: randomUUID(),
        listingId,
        ...body,
        status: 'pending_review',
        verified: false,
        featured: false,
        createdAt: new Date().toISOString(),
      }
      await db.collection('listings').insertOne(listing)
      return response({ listingId, id: listing.id, status: listing.status }, 201)
    }
    return response({ error: 'Route not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}

export async function PUT(request, { params }) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError
    const routeParams = await params
    const parts = routeParams?.path || []
    const body = await request.json()
    let db
    try { db = await getDb() } catch (databaseError) {
      if (parts[0] === 'inquiries' && parts[1]) {
        const inquiry = fallbackInquiries.find((item) => item.id === parts[1])
        if (!inquiry) return response({ error: 'Enquiry not found' }, 404)
        Object.assign(inquiry, body, { updatedAt: new Date().toISOString() })
        return response({ success: true })
      }
      if (parts[0] === 'messages' && parts[1]) {
        const message = fallbackMessages.find((item) => item.id === parts[1])
        if (!message) return response({ error: 'Message not found' }, 404)
        Object.assign(message, body, { updatedAt: new Date().toISOString() })
        return response({ success: true })
      }
      if (parts[0] === 'properties' && parts[1]) {
        const property = fallbackProperties.find((item) => item.id === parts[1])
        if (!property) return response({ error: 'Property not found' }, 404)
        Object.assign(property, body, { updatedAt: new Date().toISOString() })
        return response({ property })
      }
      throw databaseError
    }
    if (parts[0] === 'inquiries' && parts[1]) {
      const updates = { ...body, updatedAt: new Date().toISOString() }
      const result = await db.collection('inquiries').updateOne({ id: parts[1] }, { $set: updates })
      return result.matchedCount ? response({ success: true }) : response({ error: 'Enquiry not found' }, 404)
    }
    if (parts[0] === 'messages' && parts[1]) {
      const result = await db.collection('messages').updateOne({ id: parts[1] }, { $set: { ...body, updatedAt: new Date().toISOString() } })
      return result.matchedCount ? response({ success: true }) : response({ error: 'Message not found' }, 404)
    }
    if (parts[0] === 'listings' && parts[1]) {
      const { id, _id, ...updates } = body
      const existing = await db.collection('listings').findOne({ id: parts[1] })
      if (!existing) return response({ error: 'Listing not found' }, 404)
      await db.collection('listings').updateOne({ id: parts[1] }, { $set: { ...updates, updatedAt: new Date().toISOString() } })
      const merged = { ...existing, ...updates }
      // Publish on approve: keep a public property in sync with the approved listing.
      if (merged.status === 'approved') {
        await db.collection('properties').updateOne({ id: merged.id }, { $set: listingToProperty(merged) }, { upsert: true })
      } else {
        await db.collection('properties').deleteOne({ id: merged.id })
      }
      return response({ success: true, published: merged.status === 'approved' })
    }
    if (parts[0] !== 'properties' || !parts[1]) return response({ error: 'Route not found' }, 404)
    const { id, _id, ...updates } = body
    const result = await db.collection('properties').updateOne({ id: parts[1] }, { $set: { ...updates, updatedAt: new Date().toISOString() } })
    return result.matchedCount ? response({ property: serialize({ ...body, id: parts[1] }) }) : response({ error: 'Property not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}

export async function DELETE(request, { params }) {
  try {
    const authError = requireAdmin(request)
    if (authError) return authError
    const routeParams = await params
    const parts = routeParams?.path || []
    let db
    try { db = await getDb() } catch (databaseError) {
      if (parts[0] === 'messages' && parts[1]) {
        const index = fallbackMessages.findIndex((item) => item.id === parts[1])
        if (index < 0) return response({ error: 'Message not found' }, 404)
        fallbackMessages.splice(index, 1)
        return response({ success: true })
      }
      if (parts[0] === 'properties' && parts[1]) {
        const index = fallbackProperties.findIndex((item) => item.id === parts[1])
        if (index < 0) return response({ error: 'Property not found' }, 404)
        fallbackProperties.splice(index, 1)
        return response({ success: true })
      }
      throw databaseError
    }
    if (parts[0] === 'messages' && parts[1]) {
      const result = await db.collection('messages').deleteOne({ id: parts[1] })
      return result.deletedCount ? response({ success: true }) : response({ error: 'Message not found' }, 404)
    }
    if (parts[0] === 'listings' && parts[1]) {
      const result = await db.collection('listings').deleteOne({ id: parts[1] })
      await db.collection('properties').deleteOne({ id: parts[1] })
      return result.deletedCount ? response({ success: true }) : response({ error: 'Listing not found' }, 404)
    }
    if (parts[0] !== 'properties' || !parts[1]) return response({ error: 'Route not found' }, 404)
    const result = await db.collection('properties').deleteOne({ id: parts[1] })
    return result.deletedCount ? response({ success: true }) : response({ error: 'Property not found' }, 404)
  } catch (error) { return response({ error: error?.message || 'Server error' }, 500) }
}