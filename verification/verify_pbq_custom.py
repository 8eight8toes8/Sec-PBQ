
from playwright.sync_api import sync_playwright, expect

def verify_crypto_pbq_custom():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app (preview port)...")
            page.goto("http://localhost:4173")

            print("Waiting for header...")
            page.wait_for_selector(".min-h-screen", state="visible")

            print("Looking for Intermediate tab...")
            page.get_by_role("button", name="Intermediate").first.click()

            print("Clicked Intermediate")

            print("Looking for Cryptography Basics card...")
            expect(page.get_by_text("Cryptography Basics")).to_be_visible()

            # Click the card to open the new simulation
            card = page.locator("div.bg-white.rounded-xl").filter(has_text="Cryptography Basics").first
            card.click()

            print("Clicked Card, waiting for new UI...")

            # Verify the new UI is loaded (look for "Secure System Configuration")
            expect(page.get_by_text("Secure System Configuration")).to_be_visible()

            # Select correct options
            # 1. Storage: AES-256
            page.select_option("select:near(:text('Data at Rest Encryption'))", "aes256")

            # 2. Transmission: TLS 1.3
            page.select_option("select:near(:text('Transmission Protocol'))", "tls13")

            # 3. Hashing: Bcrypt
            page.select_option("select:near(:text('Integrity / Password Hashing'))", "bcrypt")

            # 4. Key Management: HSM
            page.select_option("select:near(:text('Key Management'))", "hsm")

            print("Selected all correct options")

            # Click "Run Security Audit"
            page.get_by_role("button", name="Run Security Audit").click()

            # Verify Success Message
            expect(page.get_by_text("System Secure")).to_be_visible()
            expect(page.get_by_text("100%")).to_be_visible()

            print("Audit passed successfully")

            # Take screenshot
            page.screenshot(path="verification/crypto_custom_verified.png")
            print("Screenshot saved to verification/crypto_custom_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_screenshot.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_crypto_pbq_custom()
