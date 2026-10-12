# User guide

How to use Character Explorer. No technical knowledge needed.

## 1. Opening the app

Start it with `Start.command` (double-click) or `bash start.sh` (see
[Scripts & troubleshooting](scripts-and-troubleshooting.md)). It opens in Chrome at
`http://localhost:4200`.

## 2. Choose a role

The first screen asks who you are. There is no password: this is a demonstration of role-based access.

| Role | What you can do |
| --- | --- |
| **Admin** | Browse and search all characters **and** open any character to see its details and episodes. |
| **Viewer** | Browse and search the character list only. Details are not available. |

Click **Continue as Admin** or **Continue as Viewer**. Your choice is remembered if you refresh the page, and
forgotten when you close the browser tab.

To change role at any time, click **Switch role** at the top right.

## 3. The characters page

The layout, from top to bottom: the toolbar (search box on the left, your role and **Switch role** on the
right), the page title with the number of characters and the grid/list toggle, then the characters, then the
page controls.

### What each character shows

| Field | Meaning |
| --- | --- |
| Avatar | The character's picture |
| Name | Character name |
| Status | Alive, Dead or unknown (green, red or grey dot) |
| Species | For example Human, Alien |
| Gender | As given by the show |
| Episodes | Total number of episodes the character appears in |

### Grid or list view

Use the two buttons at the top right of the page (grid icon, list icon) to switch. The view you choose is
remembered while the tab is open.

### Searching

Type in the **search box in the toolbar** to filter characters by name. Results update shortly after you stop
typing, always starting from page 1.

- The result count is shown under the title, for example "107 characters matching 'rick'".
- Click the **x** in the search box to clear it and see everyone again.
- If nothing matches you will see "No characters found for ...". That is not an error: try another name.

### Moving between pages

There are 20 characters per page. Use the arrows at the bottom (next, previous, first, last). The search term
and page are kept in the web address, so refreshing the page, using the browser's Back button, or copying the
link all keep you in the same place.

If you open a page number that does not exist, a **Go to first page** button appears.

## 4. Character details (Admin only)

Click any character card. You will see:

- The character's picture, name, status, species, gender, origin and last known location.
- **Episodes**: a table with the columns `name`, `air_date` and `episode` (for example `S01E01`).

### Filtering episodes

Type in **Filter by episode name**. The table narrows as you type; "Showing 1 of 51 episodes" tells you how many
match. The filter looks at episode **names** only (not dates or codes) and ignores upper/lower case.
Clear the box to see everything again.

### Going back

Click **Back to characters**. You return to the same page and search you left, and the character you just
viewed is highlighted with a blue outline.

## 5. What a Viewer sees

- A banner explains that details are for Admins only.
- Cards show a small **lock** icon and cannot be opened; hover to see why.
- If a Viewer types or follows a link to a character's details, the **Access denied** page appears.

### The Access denied page

It tells you which address you tried to open, your current role, and offers:

- **Back to characters**
- **Switch role** (to choose Admin)

## 6. Messages you might see

| Message | What it means | What to do |
| --- | --- | --- |
| Could not load characters. Please check your connection and try again. | The data service could not be reached | Check your internet connection, click **Retry** |
| Could not load this character. Please try again. | Same, on the details page | Click **Retry** |
| Character not found. | The character number in the address does not exist | Go back to the list |
| No characters found for ... | The search matched nobody | Change or clear the search |
| There are no characters on page N. | The page number is beyond the last page | Click **Go to first page** |
| Access denied | Your role may not open that page | Switch role or go back |

## 7. Tips

- The app needs an internet connection (character data, fonts and icons all come from the internet).
- To demo both roles quickly, use **Switch role**; your grid/list choice is kept (the search and page start fresh).
- Open **two tabs** to show Admin and Viewer side by side: each tab has its own role.
