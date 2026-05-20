import { Header, Paragraph, AlignmentType } from 'docx';

export function createArmyMemoHeader(organization?: string): Header {
  return new Header({
    children: [
      new Paragraph({
        text: 'DEPARTMENT OF THE ARMY',
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: organization || 'U.S. ARMY CORPS OF ENGINEERS',
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: 'PORTLAND DISTRICT',
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: 'PO BOX 2946',
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: 'PORTLAND OR 97208-2946',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ],
  });
}
