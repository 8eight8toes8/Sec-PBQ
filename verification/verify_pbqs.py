
from playwright.sync_api import sync_playwright

def verify_pbqs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to home
        try:
            page.goto("http://localhost:3000", timeout=10000)
            print("Loaded homepage")

            # Take screenshot of home
            page.screenshot(path="verification/home.png")

            # The app likely lists PBQs. Let's try to find them.
            # Based on memory, there might be a list.
            # I will list all buttons to see what we have.
            buttons = page.locator("button").all_inner_texts()
            print("Buttons found:", buttons)

            # Try to navigate to Multi-Zone Firewall PBQ
            # I suspect there might be cards or buttons with titles.
            firewall_btn = page.get_by_text("Multi-Zone Firewall").first
            if firewall_btn.is_visible():
                firewall_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/firewall_pbq.png")
                print("Captured firewall PBQ")

                # Exit back to home (assuming there is an exit/close button)
                # Looking at the code I wrote, there is a close button with 'fa-times' icon or similar
                # but usually clicking on the backdrop or a specific button works.
                # Let's try to go back or reload home.
                page.goto("http://localhost:3000")
            else:
                print("Firewall PBQ button not found")

            # Try to navigate to Secure Protocols PBQ
            protocols_btn = page.get_by_text("Secure Protocols").first
            if protocols_btn.is_visible():
                protocols_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/protocols_pbq.png")
                print("Captured protocols PBQ")
            else:
                print("Protocols PBQ button not found")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_pbqs()
