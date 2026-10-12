# Character Explorer: quick start (Mac)

A small Angular web app (Rick & Morty characters). These scripts install everything it
needs and open it in Chrome. You do **not** need to install Node.js, Homebrew or anything else yourself.

**You need:** a Mac with macOS 11 or newer, an internet connection, and about 1 GB of free disk space.

## First time

1. Unzip the file you received and open the `character-explorer` folder.
2. Open the **Terminal** app, type `cd ` (with a space), drag the `character-explorer` folder into the
   Terminal window, press Enter. Then run:

   ```bash
   bash setup.sh
   ```

   (Alternative: double-click `Setup.command`.)

3. Wait. The first run downloads Node.js and the project's packages (about 3 to 10 minutes). When it
   finishes, the app opens in Google Chrome at `http://localhost:4200`.
   If Chrome is not installed, your default browser is used.

In the app, pick a role: **Admin** can open character details; **Viewer** can only browse the list.

## Every time after that

| Do this | Terminal | Or double-click |
| --- | --- | --- |
| Start (and open Chrome) | `bash start.sh` | `Start.command` |
| Stop | `bash stop.sh` | `Stop.command` |
| Is it running? | `bash status.sh` | `Status.command` |

The app keeps running in the background after the Terminal window closes, so use **Stop** when you are done.

## If something goes wrong

- **macOS says a `.command` file "cannot be opened" or is from an unidentified developer:**
  right-click the file, choose **Open**, then **Open** again. Or use the Terminal commands above, which
  are not affected. (You can also allow it in System Settings > Privacy & Security > "Open Anyway".)
- **macOS asks whether Terminal may access your Downloads/Documents folder:** click **Allow**.
- **Port 4200 is busy:** the script picks the next free port by itself and prints the address it used.
- **The app does not start:** run `bash status.sh` and look at the log: `.run/dev-server.log`.
- **Setup stopped halfway (no internet, etc.):** just run `bash setup.sh` again; it continues where it stopped.

## Uninstall

Run `bash stop.sh`, then delete the `character-explorer` folder. Nothing is installed anywhere else on
your Mac (Node.js lives inside the folder, in `.tools`).
