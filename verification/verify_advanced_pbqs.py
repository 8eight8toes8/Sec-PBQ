
from playwright.sync_api import sync_playwright, expect

def verify_advanced_pbqs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app (preview port)...")
            page.goto("http://localhost:4173")
            page.wait_for_selector(".min-h-screen", state="visible")

            print("Looking for Advanced tab...")
            page.get_by_role("button", name="Advanced").first.click()

            # 1. Verify Multi-Zone Firewall
            print("Verifying Multi-Zone Firewall...")
            page.locator("div.bg-white.rounded-xl").filter(has_text="Multi-Zone Firewall").first.click()
            # Target specifically the Modal Header (h2)
            expect(page.locator("h2", has_text="Multi-Zone Firewall")).to_be_visible()
            # Click Close button (X icon)
            page.locator("button.text-gray-400").first.click()
            print("Multi-Zone Firewall Verified")

            # 2. Verify APT Detection
            print("Verifying APT Detection...")
            page.locator("div.bg-white.rounded-xl").filter(has_text="APT Detection").first.click()
            expect(page.locator("h2", has_text="APT Detection")).to_be_visible()
            # Click Close button
            page.locator("button.text-gray-400").first.click()
            print("APT Detection Verified")

            # 3. Verify Secure Network Architecture
            print("Verifying Secure Network Architecture...")
            page.locator("div.bg-white.rounded-xl").filter(has_text="Secure Network Architecture").first.click()
            expect(page.locator("h2", has_text="Secure Network Architecture")).to_be_visible()

            # Take a final screenshot
            page.screenshot(path="verification/advanced_pbqs_verified.png")
            print("Screenshot saved to verification/advanced_pbqs_verified.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_advanced.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_advanced_pbqs()
