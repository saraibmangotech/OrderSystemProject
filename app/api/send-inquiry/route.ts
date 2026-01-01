export const runtime = "nodejs"

type InquiryPayload = {
  restaurant_name?: string
  contact_person_name: string
  email: string
  phone_number: string
  body: string
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  })
}

export async function POST(req: Request) {
  let payload: InquiryPayload | null = null
  try {
    payload = (await req.json()) as InquiryPayload
  } catch {
    return jsonResponse({ status: false, message: "Invalid JSON body" }, 400)
  }

  if (!payload?.contact_person_name || !payload?.email || !payload?.phone_number || !payload?.body) {
    return jsonResponse(
      { status: false, message: "Missing required fields: contact_person_name, email, phone_number, body" },
      400,
    )
  }

  const upstreamUrl = "https://scanserve.mangotech-api.com/api/email/send-inquiry"

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const text = await upstreamRes.text()
    let data: unknown = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = { status: false, message: "Upstream returned non-JSON response", raw: text }
    }

    return jsonResponse(data, upstreamRes.status)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return jsonResponse({ status: false, message: "Failed to reach upstream API", error: message }, 502)
  }
}


