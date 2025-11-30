
from playwright.sync_api import sync_playwright

def verify_network_architecture():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:3000", timeout=10000)
            print("Loaded homepage")

            # Skip filtering, just find the card.
            # It might be down the page, so we search for it.

            # Find the 'Secure Network Architecture' card/button and click it
            # We locate by text.

            card_locator = page.locator("div").filter(has_text="Secure Network Architecture").last

            # Ensure it's there
            card_locator.scroll_into_view_if_needed()

            if card_locator.is_visible():
                print("Found card")
                # Try clicking "Launch Simulation" button inside
                launch_btn = card_locator.get_by_role("button", name="Launch Simulation")
                if launch_btn.count() > 0 and launch_btn.is_visible():
                    launch_btn.click()
                    print("Clicked Launch")
                else:
                    # Try clicking the card itself if button not found/visible
                    # But the card itself might not be clickable if title is just text.
                    # In PBQCard component, usually there is a button.
                    # Let's try searching for the button globally if scoped failed
                    print("Launch button not found in scope, trying global search specific to this card")
                    # Fallback
                    page.get_by_text("Secure Network Architecture").click()
            else:
                print("Card not found")

            page.wait_for_timeout(1000)
            page.screenshot(path="verification/network_architecture_initial.png")
            print("Captured initial state")

            # Interact: Drag and drop or Click-Click
            # Select Firewall
            page.get_by_role("button", name="Next-Gen Firewall").click()
            # Place in Edge (Perimeter Defense)
            page.get_by_text("Perimeter Defense").click()

            # Select Web Server
            page.get_by_role("button", name="Web Server").click()
            # Place in DMZ (Public Service)
            page.get_by_text("Public Service").click()

            # Select VPN
            page.get_by_role("button", name="VPN Concentrator").click()
            # Place in DMZ (Remote Access)
            page.get_by_text("Remote Access").click()

            # Select Workstation
            page.get_by_role("button", name="Employee PC").click()
            # Place in LAN (User Device)
            page.get_by_text("User Device").click()

            # Select DB Server
            page.get_by_role("button", name="SQL Database").click()
            # Place in Data Center (Backend Storage)
            page.get_by_text("Backend Storage").click()

            page.wait_for_timeout(500)
            page.screenshot(path="verification/network_architecture_filled.png")

            # Validate
            page.get_by_text("Validate Design").click()
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/network_architecture_result.png")
            print("Captured result")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_arch.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_network_architecture()
