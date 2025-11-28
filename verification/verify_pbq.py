
from playwright.sync_api import sync_playwright, expect

def verify_crypto_pbq():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app (preview port)...")
            # 1. Navigate to the app (Preview port 4173)
            page.goto("http://localhost:4173")

            # Wait for content to load
            print("Waiting for header...")
            page.wait_for_selector(".min-h-screen", state="visible")

            # 2. Find and click "Intermediate" tab to see Crypto Basics
            print("Looking for Intermediate tab...")
            page.get_by_role("button", name="Intermediate").first.click()

            print("Clicked Intermediate")

            # 3. Find "Cryptography Basics" card and click it
            print("Looking for Cryptography Basics card...")

            # Wait for the card to be visible
            expect(page.get_by_text("Cryptography Basics")).to_be_visible()

            # Find the card container
            card = page.locator("div.bg-white.rounded-xl").filter(has_text="Cryptography Basics").first

            # Click the card
            card.click()

            print("Clicked Card")

            # 4. Wait for the PBQ to load (Header should say "Cryptography Basics")
            # And ensure "Under Construction" is NOT visible
            # The Modal Header is an H2, while the card title is H3. We target H2.
            expect(page.locator("h2", has_text="Cryptography Basics")).to_be_visible()
            expect(page.get_by_text("Under Construction")).not_to_be_visible()

            print("PBQ Loaded successfully")

            # 5. Take screenshot
            page.screenshot(path="verification/crypto_pbq_verified.png")
            print("Screenshot saved to verification/crypto_pbq_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_crypto_pbq()
