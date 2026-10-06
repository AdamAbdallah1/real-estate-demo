/**
 * Firestore Security Rules test matrix.
 *
 * Run with:
 *   npx firebase emulators:exec --only firestore --project demo-test "node scripts/rules.test.mjs"
 *
 * Every case below corresponds to a real query issued by the application —
 * the public repository functions, the admin subscriptions, and the three
 * anonymous CRM write paths. Expected denials must fail specifically with
 * `permission-denied`; a denial for any other reason counts as a test failure
 * so that a broken query can never masquerade as a working rule.
 */
import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, assertSucceeds } from '@firebase/rules-unit-testing'
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query,
  onSnapshot, serverTimestamp, setDoc, updateDoc, where,
} from 'firebase/firestore'

const PROJECT_ID = 'demo-test'
const HOST = '127.0.0.1'
const PORT = 8080

let passed = 0
const failures = []
const warnings = []

function report(label, ok, detail = '') {
  if (ok) {
    passed += 1
    console.log(`  ok   ${label}`)
  } else {
    failures.push({ label, detail })
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

/** Expected denial: must be a rules denial, not a query/index/SDK error. */
async function expectDenied(label, fn) {
  try {
    await fn()
    report(label, false, 'succeeded but should have been denied')
  } catch (err) {
    const code = String(err?.code || '')
    if (code.includes('permission-denied')) report(label, true)
    else report(label, false, `denied for the wrong reason: ${code || 'unknown'} ${err?.message || err}`)
  }
}

async function expectAllowed(label, fn) {
  try {
    await fn()
    report(label, true)
  } catch (err) {
    report(label, false, `${err?.code || ''} ${err?.message || err}`)
  }
}

/**
 * The admin UI subscribes with onSnapshot (useSubscription), so query rules
 * must be provable for listeners too — not just for one-shot reads.
 *
 * Only a SERVER-confirmed snapshot counts as proof of access: a listener can
 * emit a fromCache snapshot (carrying local write mutations) before the server
 * answers, and the server answer for a denied listener is an error, never a
 * snapshot. Accepting the cache event would silently turn a denial into a pass.
 */
function listenOnce(db, queryRef, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { unsub() } catch { /* already closed */ }
      fn(value)
    }
    const timer = setTimeout(() => finish(reject, new Error('listener timeout')), timeoutMs)
    // includeMetadataChanges: without it the SDK suppresses the metadata-only
    // cache→server transition, so a legitimate listener would never be observed.
    const unsub = onSnapshot(
      queryRef,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.fromCache) return // not proof of server access
        finish(resolve, snap)
      },
      (err) => finish(reject, err),
    )
  })
}

const env = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: HOST, port: PORT },
})

/* ------------------------------------------------------------------ seed -- */

const now = () => new Date()

await env.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore()

  await setDoc(doc(db, 'admins', 'owner-uid'), {
    uid: 'owner-uid', email: 'owner@nara.test', displayName: 'Owner', role: 'owner',
    active: true, createdAt: now(), updatedAt: now(),
  })
  await setDoc(doc(db, 'admins', 'editor-uid'), {
    uid: 'editor-uid', email: 'editor@nara.test', displayName: 'Editor', role: 'editor',
    active: true, createdAt: now(), updatedAt: now(),
  })

  const property = (over = {}) => ({
    title: 'Modern Apartment',
    slug: 'modern-apartment',
    purpose: 'sale',
    status: 'published',
    propertyType: 'Apartment',
    regionLabel: 'Beirut',
    location: { city: 'Achrafieh', district: '', region: 'beirut', address: '' },
    price: 285000, currency: 'USD', area: 145, bedrooms: 2, bathrooms: 3, parking: 1,
    floor: '4th', view: 'Garden view',
    shortDescription: 'A quiet apartment.', description: 'A quiet apartment with a garden view.',
    features: ['Balcony'],
    images: [{ url: 'https://images.unsplash.com/photo-1?w=800', alt: 'Living room', order: 0 }],
    coverImage: { url: 'https://images.unsplash.com/photo-1?w=800', alt: 'Living room' },
    featured: true,
    createdAt: now(), updatedAt: now(), publishedAt: now(),
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
    ...over,
  })

  await setDoc(doc(db, 'properties', 'p1'), property())
  await setDoc(doc(db, 'properties', 'p2'), property({
    title: 'Draft Villa', slug: 'draft-villa', status: 'draft', publishedAt: null, featured: false,
  }))

  for (const section of ['general', 'contact', 'social', 'homepage', 'seo']) {
    await setDoc(doc(db, 'siteSettings', section), {
      updatedAt: now(), updatedBy: 'owner-uid',
    })
  }
  await setDoc(doc(db, 'siteSettings', 'general'), { siteName: 'NARA', tagline: 'Real Estate' }, { merge: true })
  await setDoc(doc(db, 'siteSettings', 'contact'), {
    whatsapp: '9611000000', phone: '+961 1 000 000', email: 'hello@nara.test', address: 'Beirut, Lebanon',
  }, { merge: true })

  await setDoc(doc(db, 'inquiries', 'i1'), {
    name: 'Sara', email: 'sara@test.com', phone: '+961 3 000 000', message: 'Interested.',
    source: 'contact', status: 'new', createdAt: now(), updatedAt: now(),
  })
  await setDoc(doc(db, 'viewingRequests', 'v1'), {
    propertyId: 'p1', propertyTitle: 'Modern Apartment', name: 'Sara', phone: '+961 3 000 000',
    preferredDay: 'Monday', preferredTime: 'Morning', message: '',
    status: 'new', createdAt: now(), updatedAt: now(),
  })
  await setDoc(doc(db, 'sellerLeads', 's1'), {
    name: 'Nabil', phone: '+961 3 111 111', email: '', propertyLocation: 'Byblos',
    propertyType: 'Villa', message: 'Selling soon', status: 'new', createdAt: now(), updatedAt: now(),
  })
  await setDoc(doc(db, 'editorial', 'a1'), {
    title: 'Life by the coast', slug: 'life-by-the-coast', excerpt: 'Short.', content: 'Long enough content.',
    coverImage: null, status: 'draft', createdAt: now(), updatedAt: now(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  })
})

const anon = env.unauthenticatedContext().firestore()
const visitor = env.authenticatedContext('stranger-uid').firestore()
const owner = env.authenticatedContext('owner-uid').firestore()
const editor = env.authenticatedContext('editor-uid').firestore()

/* ---------------------------- 0. source anchors (queries under test) -- */

/**
 * The admin UI never builds queries inline — every screen calls a data-layer
 * subscribe* function. Before simulating anything, assert that the queries
 * encoded in THIS file still match src/lib, and that every component still
 * wires its screen to the function assumed below. If the source drifts, the
 * suite fails loudly instead of silently testing the wrong query.
 */
const SUBSCRIPTIONS = {
  subscribeAdminProperties: {
    file: 'src/lib/firestore/properties.js',
    patterns: [
      [/const COLLECTION = 'properties'/, 'collection name'],
      [/orderBy\('updatedAt', 'desc'\)/, 'orderBy updatedAt desc'],
      [/fbLimit\(max\)/, 'bounded limit'],
      [/max = 300/, 'default bound 300'],
    ],
    build: (db) => query(collection(db, 'properties'), orderBy('updatedAt', 'desc'), limit(300)),
    readableByAnonymous: false,
  },
  subscribeInquiries: {
    file: 'src/lib/firestore/inquiries.js',
    patterns: [
      [/const COLLECTION = 'inquiries'/, 'collection name'],
      [/orderBy\('createdAt', 'desc'\)/, 'orderBy createdAt desc'],
      [/max = 200/, 'default bound 200'],
    ],
    build: (db) => query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(200)),
    readableByAnonymous: false,
  },
  subscribeViewingRequests: {
    file: 'src/lib/firestore/viewingRequests.js',
    patterns: [
      [/const COLLECTION = 'viewingRequests'/, 'collection name'],
      [/orderBy\('createdAt', 'desc'\)/, 'orderBy createdAt desc'],
      [/max = 200/, 'default bound 200'],
    ],
    build: (db) => query(collection(db, 'viewingRequests'), orderBy('createdAt', 'desc'), limit(200)),
    readableByAnonymous: false,
  },
  subscribeSellerLeads: {
    file: 'src/lib/firestore/sellerLeads.js',
    patterns: [
      [/const COLLECTION = 'sellerLeads'/, 'collection name'],
      [/orderBy\('createdAt', 'desc'\)/, 'orderBy createdAt desc'],
      [/max = 200/, 'default bound 200'],
    ],
    build: (db) => query(collection(db, 'sellerLeads'), orderBy('createdAt', 'desc'), limit(200)),
    readableByAnonymous: false,
  },
  subscribeEditorial: {
    file: 'src/lib/firestore/editorial.js',
    patterns: [
      [/const COLLECTION = 'editorial'/, 'collection name'],
      [/orderBy\('updatedAt', 'desc'\)/, 'orderBy updatedAt desc'],
      [/max = 100/, 'default bound 100'],
    ],
    build: (db) => query(collection(db, 'editorial'), orderBy('updatedAt', 'desc'), limit(100)),
    readableByAnonymous: false,
  },
  subscribeSettings: {
    file: 'src/lib/firestore/settings.js',
    patterns: [
      [/const COLLECTION = 'siteSettings'/, 'collection name'],
      [/onSnapshot\(\s*collection\(requireDb\(\), COLLECTION\)/, 'unfiltered collection listener'],
    ],
    build: (db) => collection(db, 'siteSettings'),
    readableByAnonymous: true, // hero/contact/social/SEO are public content
  },
}

const CALL_SITES = [
  ['ContentPage', 'subscribeAdminProperties'],
  ['PropertiesPage', 'subscribeAdminProperties'],
  ['OverviewPage (properties)', 'subscribeAdminProperties'],
  ['OverviewPage (inquiries)', 'subscribeInquiries'],
  ['OverviewPage (viewings)', 'subscribeViewingRequests'],
  ['OverviewPage (seller leads)', 'subscribeSellerLeads'],
  ['LeadWorkbench (inquiries)', 'subscribeInquiries'],
  ['LeadWorkbench (viewings)', 'subscribeViewingRequests'],
  ['LeadWorkbench (seller leads)', 'subscribeSellerLeads'],
  ['EditorialPage', 'subscribeEditorial'],
  ['useSettingsForm (Content + Settings)', 'subscribeSettings'],
]

const WIRING = [
  ['src/admin/pages/ContentPage.jsx', [/useSubscription\(asItems\)/, /subscribeAdminProperties/]],
  ['src/admin/pages/PropertiesPage.jsx', [/useSubscription\(asItems\)/, /subscribeAdminProperties/]],
  ['src/admin/pages/OverviewPage.jsx', [/asItems\(subscribeAdminProperties\)/, /asItems\(subscribeInquiries\)/,
    /asItems\(subscribeViewingRequests\)/, /asItems\(subscribeSellerLeads\)/]],
  ['src/admin/components/LeadWorkbench.jsx', [/useSubscription\(subscribe\)/]],
  ['src/admin/pages/InquiriesPage.jsx', [/subscribe=\{subscribeInquiries\}/]],
  ['src/admin/pages/ViewingsPage.jsx', [/subscribe=\{subscribeViewingRequests\}/]],
  ['src/admin/pages/SellerLeadsPage.jsx', [/subscribe=\{subscribeSellerLeads\}/]],
  ['src/admin/pages/EditorialPage.jsx', [/subscribeEditorial\(cb\)/]],
  ['src/admin/hooks/useSettingsForm.js', [/subscribeSettings\(/]],
]

function bodyOf(file, fn) {
  const text = readFileSync(file, 'utf8')
  const marker = `export function ${fn}(`
  const start = text.indexOf(marker)
  if (start < 0) throw new Error(`${file}: ${fn}() not found — update scripts/rules.test.mjs`)
  const next = text.indexOf('\nexport ', start + marker.length)
  return text.slice(start, next < 0 ? text.length : next)
}

console.log('\n[0] Simulated queries are anchored to the real source')
for (const [fn, spec] of Object.entries(SUBSCRIPTIONS)) {
  const text = readFileSync(spec.file, 'utf8')
  const body = bodyOf(spec.file, fn)
  for (const [re, label] of spec.patterns) {
    // COLLECTION is declared at module level; query shape lives in the function.
    const hay = label === 'collection name' ? text : body
    if (!re.test(hay)) throw new Error(`${spec.file} → ${fn}(): expected ${label} (${re})`)
  }
  report(`source: ${fn} matches this file's simulated query`, true)
}
for (const [file, patterns] of WIRING) {
  const text = readFileSync(file, 'utf8')
  for (const re of patterns) {
    if (!re.test(text)) throw new Error(`${file}: expected ${re}`)
  }
  report(`wiring: ${file}`, true)
}

/* ------------------------------------------------ 1. public property reads -- */

console.log('\n[1] Public property reads (useProperties / getPublishedProperties)')

await expectAllowed('anonymous: published query with orderBy (primary path)', () =>
  assertSucceeds(getDocs(query(collection(anon, 'properties'),
    where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(60)))))

await expectAllowed('anonymous: published query without orderBy (index fallback path)', () =>
  assertSucceeds(getDocs(query(collection(anon, 'properties'),
    where('status', '==', 'published'), limit(60)))))

await expectAllowed('anonymous: get a published property by id', () =>
  assertSucceeds(getDoc(doc(anon, 'properties', 'p1'))))

await expectDenied('anonymous: get a draft property by id', () =>
  getDoc(doc(anon, 'properties', 'p2')))

await expectDenied('anonymous: unfiltered list (admin list query)', () =>
  getDocs(query(collection(anon, 'properties'), orderBy('updatedAt', 'desc'), limit(300))))

await expectDenied('anonymous: create a property', () =>
  addDoc(collection(anon, 'properties'), { title: 'Injected', status: 'published' }))

await expectDenied('anonymous: update a published property', () =>
  updateDoc(doc(anon, 'properties', 'p1'), { price: 1 }))

await expectDenied('anonymous: delete a published property', () =>
  deleteDoc(doc(anon, 'properties', 'p1')))

/* ------------------------------------------------------ 2. admin property -- */

console.log('\n[2] Admin property queries (PropertiesPage / OverviewPage)')

await expectAllowed('admin: list query ordered by updatedAt', () =>
  assertSucceeds(getDocs(query(collection(owner, 'properties'), orderBy('updatedAt', 'desc'), limit(300)))))

await expectAllowed('editor: same list query', () =>
  assertSucceeds(getDocs(query(collection(editor, 'properties'), orderBy('updatedAt', 'desc'), limit(300)))))

await expectDenied('non-admin signed-in user: list query denied', () =>
  getDocs(query(collection(visitor, 'properties'), orderBy('updatedAt', 'desc'), limit(300))))

const validProperty = {
  title: 'New Listing', slug: 'new-listing', purpose: 'sale', status: 'draft',
  propertyType: 'Apartment', regionLabel: 'Beirut',
  location: { city: 'Beirut', district: '', region: 'beirut', address: '' },
  price: 100000, currency: 'USD', area: 100, bedrooms: 1, bathrooms: 1, parking: 0,
  floor: '', view: '', shortDescription: 'Short.', description: 'A full description of the property.',
  features: [], images: [{ url: 'https://images.unsplash.com/x?w=800', alt: '', order: 0 }],
  coverImage: { url: 'https://images.unsplash.com/x?w=800', alt: '' }, featured: false,
}

await expectAllowed('admin: create a valid property (server timestamps)', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

/* --------------------------- bilingual (localized) content -------------------- */

const bilingualDoc = (over = {}) => ({
  ...validProperty,
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
  createdBy: 'owner-uid', updatedBy: 'owner-uid',
  ...over,
})

await expectAllowed('admin: create with {en,ar} title, descriptions and features', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'bilingual-listing',
    title: { en: 'New Listing', ar: 'عقار جديد' },
    shortDescription: { en: 'Short.', ar: 'وصف مختصر.' },
    description: { en: 'A full description of the property.', ar: 'وصف كامل للعقار باللغة العربية.' },
    features: { en: ['Balcony', 'Sea view'], ar: ['شرفة', 'إطلالة بحرية'] },
  })))

await expectAllowed('admin: create with Arabic-only {en,ar} title', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'arabic-only',
    title: { en: '', ar: 'شقة في الأشرفية' },
  })))

await expectDenied('admin: bilingual title missing the ar key rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'missing-ar', title: { en: 'New Listing' },
  })))

await expectDenied('admin: bilingual title with both languages empty rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'empty-title', title: { en: '', ar: '' },
  })))

await expectDenied('admin: bilingual title with an unknown language key rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'extra-language', title: { en: 'New Listing', ar: 'عقار جديد', fr: 'Nouveau' },
  })))

await expectDenied('admin: bilingual title above the character cap rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'title-too-long', title: { en: 'New Listing', ar: 'ع'.repeat(121) },
  })))

await expectDenied('admin: bilingual feature list missing the ar key rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'feature-missing-ar', features: { en: ['Balcony'] },
  })))

await expectDenied('admin: feature list over the item cap rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'too-many-features',
    features: { en: Array.from({ length: 41 }, (_, i) => `Feature ${i}`), ar: [] },
  })))

await expectDenied('admin: non-string feature entry rejected', () =>
  addDoc(collection(owner, 'properties'), bilingualDoc({
    slug: 'feature-not-a-string', features: [{ en: 'Balcony' }],
  })))

await expectAllowed('admin: update a legacy string property to bilingual content', () =>
  updateDoc(doc(owner, 'properties', 'p2'), {
    title: { en: 'Draft Villa', ar: 'فيلا قيد الإعداد' },
    shortDescription: { en: 'A quiet villa.', ar: 'فيلا هادئة.' },
    updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

await expectDenied('admin: create with http:// image rejected', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty, slug: 'http-image',
    images: [{ url: 'http://insecure.example/x.jpg', alt: '', order: 0 }],
    coverImage: { url: 'http://insecure.example/x.jpg', alt: '' },
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectDenied('admin: invalid status value rejected', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty, slug: 'bad-status', status: 'live',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectDenied('admin: foreign createdBy rejected', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty, slug: 'foreign-owner',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'someone-else', updatedBy: 'owner-uid',
  }))

await expectAllowed('admin: update a property (server timestamps)', () =>
  updateDoc(doc(owner, 'properties', 'p1'), {
    price: 300000, updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

await expectAllowed('admin: status change to archived keeps publishedAt', () =>
  updateDoc(doc(owner, 'properties', 'p1'), {
    status: 'archived', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

await expectDenied('admin: update with client-generated timestamp rejected', () =>
  updateDoc(doc(owner, 'properties', 'p1'), {
    updatedAt: new Date(), updatedBy: 'owner-uid',
  }))

await expectDenied('admin: create with > 10 gallery images rejected', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty,
    slug: 'too-many-images',
    images: Array.from({ length: 11 }, (_, i) => ({
      url: `https://images.unsplash.com/x${i}?w=800`, alt: '', order: i,
    })),
    coverImage: { url: 'https://images.unsplash.com/x0?w=800', alt: '' },
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectDenied('admin: image entry missing its alt key rejected', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty,
    slug: 'missing-alt',
    images: [{ url: 'https://images.unsplash.com/x?w=800', order: 0 }],
    coverImage: { url: 'https://images.unsplash.com/x?w=800', alt: '' },
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectDenied('admin: image entry carrying an extra field rejected', () =>
  addDoc(collection(owner, 'properties'), {
    ...validProperty,
    slug: 'extra-image-field',
    images: [{ url: 'https://images.unsplash.com/x?w=800', alt: '', order: 0, raw: 'data' }],
    coverImage: { url: 'https://images.unsplash.com/x?w=800', alt: '' },
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

/* -------------------------------------------------- 3. public CRM creates -- */

console.log('\n[3] Anonymous CRM writes (inquiries, viewing requests, seller leads)')

const inquiry = {
  name: 'Sara', email: 'sara@test.com', phone: '+961 3 000 000', message: 'Interested.',
  source: 'contact', status: 'new', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
}

await expectAllowed('anonymous: valid inquiry create', () =>
  addDoc(collection(anon, 'inquiries'), inquiry))

await expectDenied('anonymous: inquiry with status other than new', () =>
  addDoc(collection(anon, 'inquiries'), { ...inquiry, status: 'closed' }))

await expectDenied('anonymous: inquiry with an admin field (updatedBy)', () =>
  addDoc(collection(anon, 'inquiries'), { ...inquiry, updatedBy: 'owner-uid' }))

await expectDenied('anonymous: inquiry without server timestamps', () =>
  addDoc(collection(anon, 'inquiries'), { ...inquiry, createdAt: new Date() }))

await expectDenied('anonymous: inquiry with an oversized message', () =>
  addDoc(collection(anon, 'inquiries'), { ...inquiry, message: 'x'.repeat(2500) }))

await expectAllowed('anonymous: valid viewing request create', () =>
  addDoc(collection(anon, 'viewingRequests'), {
    propertyId: 'p1', propertyTitle: 'Modern Apartment', name: 'Sara', phone: '+961 3 000 000',
    preferredDay: 'Monday', preferredTime: 'Morning', message: '', status: 'new',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }))

await expectDenied('anonymous: viewing request with an invalid phone', () =>
  addDoc(collection(anon, 'viewingRequests'), {
    propertyId: 'p1', propertyTitle: 'x', name: 'Sara', phone: 'not-a-phone',
    preferredDay: '', preferredTime: '', message: '', status: 'new',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }))

await expectAllowed('anonymous: valid seller lead create', () =>
  addDoc(collection(anon, 'sellerLeads'), {
    name: 'Nabil', phone: '+961 3 111 111', email: '', propertyLocation: 'Byblos',
    propertyType: 'Villa', message: 'Selling soon', status: 'new',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }))

await expectDenied('anonymous: seller lead marking itself qualified', () =>
  addDoc(collection(anon, 'sellerLeads'), {
    name: 'Nabil', phone: '+961 3 111 111', email: '', propertyLocation: 'Byblos',
    propertyType: 'Villa', message: 'Selling soon', status: 'qualified',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }))

await expectDenied('anonymous: read the inquiries list', () =>
  getDocs(query(collection(anon, 'inquiries'), orderBy('createdAt', 'desc'), limit(200))))

await expectDenied('anonymous: update an existing inquiry status', () =>
  updateDoc(doc(anon, 'inquiries', 'i1'), { status: 'closed' }))

await expectDenied('admin: update an inquiry under a different uid', () =>
  updateDoc(doc(owner, 'inquiries', 'i1'), {
    status: 'contacted', updatedAt: serverTimestamp(), updatedBy: 'editor-uid',
  }))

await expectDenied('anonymous: delete an existing inquiry', () =>
  deleteDoc(doc(anon, 'inquiries', 'i1')))

await expectDenied('anonymous: read the viewing requests list', () =>
  getDocs(query(collection(anon, 'viewingRequests'), orderBy('createdAt', 'desc'), limit(200))))

await expectDenied('anonymous: read the seller leads list', () =>
  getDocs(query(collection(anon, 'sellerLeads'), orderBy('createdAt', 'desc'), limit(200))))

/* ------------------------------------------------- 4. admin CRM management -- */

console.log('\n[4] Admin CRM lists and status changes')

await expectAllowed('admin: inquiries list', () =>
  assertSucceeds(getDocs(query(collection(owner, 'inquiries'), orderBy('createdAt', 'desc'), limit(200)))))

await expectAllowed('admin: viewing requests list', () =>
  assertSucceeds(getDocs(query(collection(owner, 'viewingRequests'), orderBy('createdAt', 'desc'), limit(200)))))

await expectAllowed('admin: seller leads list', () =>
  assertSucceeds(getDocs(query(collection(owner, 'sellerLeads'), orderBy('createdAt', 'desc'), limit(200)))))

await expectAllowed('admin: mark an inquiry contacted', () =>
  updateDoc(doc(owner, 'inquiries', 'i1'), {
    status: 'contacted', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

await expectDenied('admin: invalid inquiry status rejected', () =>
  updateDoc(doc(owner, 'inquiries', 'i1'), {
    status: 'escalated', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

await expectAllowed('admin: delete a seller lead', () =>
  deleteDoc(doc(owner, 'sellerLeads', 's1')))

await expectDenied('non-admin signed-in user: inquiries list', () =>
  getDocs(query(collection(visitor, 'inquiries'), orderBy('createdAt', 'desc'), limit(200))))

/* -------------------------------------------------------- 5. editorial -- */

console.log('\n[5] Editorial')

await expectAllowed('admin: editorial list', () =>
  assertSucceeds(getDocs(query(collection(owner, 'editorial'), orderBy('updatedAt', 'desc'), limit(100)))))

await expectDenied('anonymous: editorial list', () =>
  getDocs(query(collection(anon, 'editorial'), orderBy('updatedAt', 'desc'), limit(100))))

await expectAllowed('admin: create a valid article', () =>
  addDoc(collection(owner, 'editorial'), {
    title: 'Coast notes', slug: 'coast-notes', excerpt: 'Short.', content: 'Long enough content.',
    coverImage: null, status: 'draft',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectDenied('admin: article with an invalid status rejected', () =>
  addDoc(collection(owner, 'editorial'), {
    title: 'Bad status', slug: 'bad-status', excerpt: 'Short.', content: 'Long enough content.',
    coverImage: null, status: 'live',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectAllowed('admin: create a bilingual article with SEO fields', () =>
  addDoc(collection(owner, 'editorial'), {
    title: { en: 'Coast notes', ar: 'ملاحظات الساحل' },
    slug: 'coast-notes-ar',
    excerpt: { en: 'Short.', ar: 'ملخص قصير.' },
    content: { en: 'Long enough content.', ar: 'محتوى كافٍ باللغة العربية هنا.' },
    seoTitle: { en: 'Coast notes', ar: 'ملاحظات الساحل' },
    seoDescription: { en: '', ar: '' },
    coverImage: null, status: 'draft',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectDenied('admin: bilingual article title missing the ar key rejected', () =>
  addDoc(collection(owner, 'editorial'), {
    title: { en: 'No arabic' }, slug: 'no-arabic', excerpt: { en: 'Short.', ar: '' },
    content: { en: 'Long enough content.', ar: '' },
    seoTitle: '', seoDescription: '',
    coverImage: null, status: 'draft',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: null,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  }))

await expectAllowed('admin: update a legacy article that has no SEO fields yet', () =>
  updateDoc(doc(owner, 'editorial', 'a1'), {
    status: 'published', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

await expectAllowed('admin: update an article to bilingual content', () =>
  updateDoc(doc(owner, 'editorial', 'a1'), {
    title: { en: 'Life by the coast', ar: 'الحياة على الساحل' },
    excerpt: { en: 'Short.', ar: 'ملخص' },
    seoTitle: { en: 'Life by the coast', ar: 'الحياة على الساحل' },
    seoDescription: { en: '', ar: '' },
    updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }))

/* ------------------------------------------------------- 6. site settings -- */

console.log('\n[6] Site settings')

await expectAllowed('anonymous: read the site settings collection (public hero/contact/social/SEO)', () =>
  assertSucceeds(getDocs(collection(anon, 'siteSettings'))))

await expectDenied('anonymous: write a settings section', () =>
  setDoc(doc(anon, 'siteSettings', 'contact'), { whatsapp: '000', updatedAt: serverTimestamp(), updatedBy: 'anon' }))

await expectAllowed('admin: save a settings section', () =>
  setDoc(doc(owner, 'siteSettings', 'contact'), {
    whatsapp: '9611000000', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }, { merge: true }))

await expectDenied('admin: unknown settings key rejected', () =>
  setDoc(doc(owner, 'siteSettings', 'contact'), {
    apiKey: 'should-not-exist', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }, { merge: true }))

await expectDenied('admin: writing an unknown settings document rejected', () =>
  setDoc(doc(owner, 'siteSettings', 'secrets'), {
    token: 'x', updatedAt: serverTimestamp(), updatedBy: 'owner-uid',
  }, { merge: true }))

/* -------------------------------------------------- 7. admin authorization -- */

console.log('\n[7] Authorization boundary (admins/{uid})')

await expectAllowed('signed-in non-admin: read own (missing) admin record', () =>
  assertSucceeds(getDoc(doc(visitor, 'admins', 'stranger-uid'))))

// Regression: the exact operation login() performs — the signed-in owner
// reading admins/{own uid}. A deny-all ruleset (the project default) broke
// this in production and the client misreported it as "no CMS access".
await expectAllowed('owner (admin): read own admin record', () =>
  assertSucceeds(getDoc(doc(owner, 'admins', 'owner-uid'))))

await expectDenied('signed-in non-admin: create own admin record', () =>
  setDoc(doc(visitor, 'admins', 'stranger-uid'), {
    uid: 'stranger-uid', role: 'owner', active: true, createdAt: now(), updatedAt: now(),
  }))

await expectDenied('signed-in non-admin: escalate another account', () =>
  setDoc(doc(visitor, 'admins', 'owner-uid'), { role: 'owner', active: true }))

await expectDenied('owner (admin): change a role from the client', () =>
  updateDoc(doc(owner, 'admins', 'editor-uid'), { role: 'owner' }))

await expectDenied('owner (admin): deactivate an account from the client', () =>
  updateDoc(doc(owner, 'admins', 'editor-uid'), { active: false }))

await expectDenied('anonymous: list admin records', () =>
  getDocs(collection(anon, 'admins')))

await expectDenied('anonymous: read an admin record', () =>
  getDoc(doc(anon, 'admins', 'owner-uid')))

/* ------------------------ 8. useSubscription call sites (live listeners) -- */

/**
 * useSubscription listens with onSnapshot, so rules must be provable for a
 * listener — a one-shot getDocs pass is not sufficient evidence. Each admin
 * call site is replayed as the identity it runs under (owner, then editor for
 * role coverage), and the same query is replayed anonymously to prove a
 * signed-out client cannot subscribe to it.
 *
 * Only a SERVER snapshot counts: a listener can emit a fromCache event
 * (carrying local write mutations) before the server answers, and a denied
 * listener's server answer is an error, never a snapshot.
 */
console.log('\n[8] Every useSubscription call site, as a live listener')

// Fixtures must exist, otherwise an empty result set could look like a pass.
await env.withSecurityRulesDisabled(async (context) => {
  const db = context.firestore()
  const stamp = now()
  await setDoc(doc(db, 'properties', 'p1'), {
    title: 'Modern Apartment', slug: 'modern-apartment', purpose: 'sale', status: 'published',
    propertyType: 'Apartment', regionLabel: 'Beirut',
    location: { city: 'Achrafieh', district: '', region: 'beirut', address: '' },
    price: 285000, currency: 'USD', area: 145, bedrooms: 2, bathrooms: 3, parking: 1,
    floor: '4th', view: 'Garden view', shortDescription: 'A quiet apartment.',
    description: 'A quiet apartment with a garden view.', features: ['Balcony'],
    images: [{ url: 'https://images.unsplash.com/photo-1?w=800', alt: 'Living room', order: 0 }],
    coverImage: { url: 'https://images.unsplash.com/photo-1?w=800', alt: 'Living room' },
    featured: true, createdAt: stamp, updatedAt: stamp, publishedAt: stamp,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  })
  await setDoc(doc(db, 'inquiries', 'i1'), {
    name: 'Sara', email: 'sara@test.com', phone: '+961 3 000 000', message: 'Interested.',
    source: 'contact', status: 'contacted', createdAt: stamp, updatedAt: stamp,
    updatedBy: 'owner-uid',
  })
  await setDoc(doc(db, 'viewingRequests', 'v1'), {
    propertyId: 'p1', propertyTitle: 'Modern Apartment', name: 'Sara', phone: '+961 3 000 000',
    preferredDay: 'Monday', preferredTime: 'Morning', message: '', status: 'new',
    createdAt: stamp, updatedAt: stamp,
  })
  await setDoc(doc(db, 'sellerLeads', 's1'), {
    name: 'Nabil', phone: '+961 3 111 111', email: '', propertyLocation: 'Byblos',
    propertyType: 'Villa', message: 'Selling soon', status: 'new',
    createdAt: stamp, updatedAt: stamp,
  })
  await setDoc(doc(db, 'editorial', 'a1'), {
    title: 'Life by the coast', slug: 'life-by-the-coast', excerpt: 'Short.',
    content: 'Long enough content.', coverImage: null, status: 'published',
    createdAt: stamp, updatedAt: stamp, publishedAt: stamp,
    createdBy: 'owner-uid', updatedBy: 'owner-uid',
  })
})

// (a) every call site, as the signed-in admin identity that renders it
for (const [site, fn] of CALL_SITES) {
  const build = SUBSCRIPTIONS[fn].build
  await expectAllowed(`${site} → ${fn}`, () => listenOnce(owner, build(owner)))
}

// (b) a second admin role gets the same access (role is not part of the rules;
//     active membership in admins/{uid} is)
await expectAllowed('editor role: properties list listener', () =>
  listenOnce(editor, SUBSCRIPTIONS.subscribeAdminProperties.build(editor)))

// (c) the identical queries, as a signed-out visitor — must all be denied
for (const [fn, spec] of Object.entries(SUBSCRIPTIONS)) {
  if (spec.readableByAnonymous) continue
  await expectDenied(`anonymous listener denied: ${fn}`, () =>
    listenOnce(anon, spec.build(anon)))
}

// (d) a signed-in stranger (authenticated, but with no admins/{uid} record)
await expectDenied('signed-in non-admin denied: subscribeAdminProperties', () =>
  listenOnce(visitor, SUBSCRIPTIONS.subscribeAdminProperties.build(visitor)))

// (e) the one anonymous subscription that IS public: siteSettings
await expectAllowed('anonymous listener allowed: subscribeSettings (public content)', () =>
  listenOnce(anon, SUBSCRIPTIONS.subscribeSettings.build(anon)))

// (f) the public site's one-shot reads (getDocs, not listeners)
await expectAllowed('anonymous one-shot: published properties (getPublishedProperties)', () =>
  assertSucceeds(getDocs(query(collection(anon, 'properties'),
    where('status', '==', 'published'), orderBy('publishedAt', 'desc'), limit(60)))))

await expectAllowed('anonymous one-shot: siteSettings collection (getSettings)', () =>
  assertSucceeds(getDocs(collection(anon, 'siteSettings'))))

/* ------------------------------------------------------------- 9. cleanup -- */

await env.cleanup()

console.log(`\n${passed} passed, ${failures.length} failed, ${warnings.length} warning(s)`)
if (warnings.length) {
  console.log('\nWarnings:')
  warnings.forEach((w) => console.log(`  - ${w.label}: ${w.detail}`))
}
if (failures.length) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f.label}: ${f.detail}`))
  process.exit(1)
}
