import { TimetableEvent } from "@/types";
import { Document, Packer, Paragraph, TextRun } from "docx";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function eventsToRows(events: TimetableEvent[]) {
  return events.map((e) => ({
    Day: e.day,
    Title: e.title,
    Start: e.startTime,
    End: e.endTime,
    Category: e.category,
    Location: e.location ?? "",
    Description: e.description ?? "",
  }));
}

export function exportAsPdf(events: TimetableEvent[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Forge Timetable", 14, 20);
  doc.setFontSize(10);

  let y = 30;
  for (const e of events) {
    const line = `${e.day} | ${e.startTime}-${e.endTime} | ${e.title} (${e.category})`;
    doc.text(line, 14, y);
    y += 6;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save("forge-timetable.pdf");
}

export function exportAsXlsx(events: TimetableEvent[]) {
  const ws = XLSX.utils.json_to_sheet(eventsToRows(events));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timetable");
  XLSX.writeFile(wb, "forge-timetable.xlsx");
}

export async function exportAsDocx(events: TimetableEvent[]) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Forge Timetable", bold: true, size: 32 })],
          }),
          ...events.map(
            (e) =>
              new Paragraph(
                `${e.day} | ${e.startTime}-${e.endTime} | ${e.title} (${e.category})`
              )
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "forge-timetable.docx";
  a.click();
  URL.revokeObjectURL(url);
}
