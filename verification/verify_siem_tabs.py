
from playwright.sync_api import sync_playwright

def verify_siem_tabs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:3000", timeout=10000)
            print("Loaded homepage")

            # Find the card "SIEM Log Analysis"
            # It might be an H3 or similar.
            card_title = page.locator("h3").filter(has_text="SIEM Log Analysis").first

            # Scroll to it
            card_title.scroll_into_view_if_needed()

            # Click it (or the launch button inside its parent)
            card_title.click()
            print("Clicked SIEM PBQ Card Title")

            # Check if modal opened (look for unique text in modal)
            # "Event Logs [Live Capture]"
            page.wait_for_selector("text=Event Logs [Live Capture]", timeout=5000)
            print("Launched SIEM PBQ Modal")

            page.screenshot(path="verification/siem_search_tab.png")
            print("Captured Search Tab")

            # Click Dashboards Tab
            page.get_by_role("button", name="Dashboards").click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/siem_dashboard_tab.png")
            print("Captured Dashboard Tab")

            # Click Alerts Tab
            page.get_by_role("button", name="Alerts").click()
            page.wait_for_timeout(500)
            page.screenshot(path="verification/siem_alerts_tab.png")
            print("Captured Alerts Tab")

            # Test selecting a log from Alerts tab
            # Find a row with CRITICAL. Click the row, not the text "CRITICAL" specifically
            # to ensure we hit the tr/td click handler.
            # We can find a row that contains "CRITICAL"
            row = page.locator("tr").filter(has_text="CRITICAL").first
            if row.is_visible():
                row.click()
                print("Clicked CRITICAL log in Alerts tab")

                # Check if it selected (visual check via screenshot or class check)
                # But we can try to assign it to "Initial Access" (even if wrong) to see if it works
                # Find the mapping container for "Initial Access"
                # It has label "1. Initial Access"
                # And a clickable area below it.
                # We can click the area. It has text "Click to assign selected log" if selected.

                assign_area = page.locator("text=Click to assign selected log").first
                if assign_area.is_visible():
                    assign_area.click()
                    print("Assigned log to Initial Access")
                else:
                    print("Could not find 'Click to assign selected log' - selection might have failed")

                page.screenshot(path="verification/siem_assignment.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_siem.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_siem_tabs()
