# Turning on Learning Center Pro payments

Learning Center Pro stays in "Pro opens soon" mode until you connect two services: **Supabase** (accounts) and **Stripe** (payments). Free
preview lessons work the whole time. Nothing is charged until you finish every step.

You do every step below yourself, in your own accounts. Never paste a secret key
into a chat, an email, or any file in this repository.

## 1. Accounts: Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor** and run, in order:
   - `migrations/001_auvrantis.sql`
   - `migrations/002_learn_subscriptions.sql`
3. In **Authentication → URL Configuration**, set the Site URL to
   `https://auvrantis-create.vercel.app`, and add
   `https://auvrantis-create.vercel.app/api/cloud/callback` to **Redirect URLs**.
4. From **Project Settings → API**, note the **Project URL** and the
   **service_role** key. The service_role key is secret.

## 2. Payments: Stripe (start in test mode)

1. Create an account at stripe.com and keep **Test mode** switched on.
2. In **Product catalog**, create one product, "Auvrantis Create", with two
   **recurring monthly** prices:
   - Starter: **$5.99 / month**
   - Unlimited: **$15.99 / month**

   Note each price's ID (it starts with `price_`).
3. In **Developers → API keys**, note the **Secret key** (`sk_test_…`).
4. In **Developers → Webhooks**, add an endpoint:
   - URL: `https://auvrantis-create.vercel.app/api/learn/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`

   Then note its **Signing secret** (`whsec_…`).
5. In **Settings → Billing → Customer portal**, turn the portal on so members can
   cancel or change their plan from their account page.

## 3. Connect them in Vercel

In Vercel, open the **auvrantis-create** project → **Settings → Environment
Variables**, and add these for **Production** (and Preview if you want to test there):

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_STARTER` | Starter price ID |
| `STRIPE_PRICE_UNLIMITED` | Unlimited price ID |

Redeploy the site after saving them.

## 4. Test it end to end (still in test mode)

1. Open `/learn/account`, create an account, and confirm your email.
2. Choose a plan. On Stripe's checkout page, pay with the test card
   `4242 4242 4242 4242`, any future expiry date and any three-digit CVC.
3. You return to your account page, which should say **You have full access**.
4. Open a locked Pro lesson; it should show the full lesson.
5. Use **Manage billing** to cancel, and check that the lesson locks again.

## 5. Go live

Repeat step 2 with **Test mode off** (live products, live keys and a live webhook),
replace the three Stripe values in Vercel with the live ones, and redeploy.
