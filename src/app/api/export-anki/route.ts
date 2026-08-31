import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deckName, cards } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "No cards provided" }, { status: 400 });
    }

    // Create a temporary JSON file with the cards
    const tmpDir = os.tmpdir();
    const timestamp = Date.now();
    const jsonPath = path.join(tmpDir, `anki_input_${timestamp}.json`);
    const apkgPath = path.join(tmpDir, `Medicinety_Deck_${timestamp}.apkg`);

    fs.writeFileSync(jsonPath, JSON.stringify({ deckName: deckName || "Medicinety Deck", cards }), "utf-8");

    // Execute Python helper to generate SQLite .apkg
    const scriptPath = path.join(process.cwd(), "scripts", "build_apkg_from_json.py");
    
    await new Promise((resolve, reject) => {
      exec(`python "${scriptPath}" "${jsonPath}" "${apkgPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error("Python anki build error:", error, stderr);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    if (!fs.existsSync(apkgPath)) {
      throw new Error("Generated APKG file not found");
    }

    const fileBuffer = fs.readFileSync(apkgPath);

    // Clean up temporary files
    try {
      fs.unlinkSync(jsonPath);
      fs.unlinkSync(apkgPath);
    } catch (e) {}

    const sanitizedDeckName = (deckName || "Medicinety_Deck").replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, "_");

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(sanitizedDeckName)}.apkg"`,
      },
    });
  } catch (error: any) {
    console.error("Export Anki error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate deck" }, { status: 500 });
  }
}
