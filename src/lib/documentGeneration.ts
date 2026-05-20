import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  WidthType,
  Packer,
  BorderStyle,
} from 'docx';
import {
  RewrittenContent,
  ContentSection,
  ActionItem,
  Decision,
  RiskIssue,
} from '@/types/documents';

function safeString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function safeArray<T>(value: any): T[] {
  if (!value || !Array.isArray(value)) return [];
  return value;
}

function highlightPlaceholders(text: string): TextRun[] {
  const safeText = safeString(text);
  if (!safeText || safeText.length === 0) {
    return [new TextRun({ text: '', font: 'Arial' })];
  }

  const parts = safeText.split(/(\[[^\]]*\])/g);
  const runs: TextRun[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part || part.length === 0) continue;

    if (part.startsWith('[') && part.endsWith(']')) {
      runs.push(
        new TextRun({
          text: part,
          highlight: 'yellow',
          bold: true,
          color: '000000',
          font: 'Arial',
        }),
      );
    } else {
      runs.push(
        new TextRun({
          text: part,
          font: 'Arial',
        }),
      );
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text: '', font: 'Arial' })];
}

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
};

export async function generateDocx(content: RewrittenContent): Promise<Blob> {
  try {
    const metadata = content.metadata || {};
    const children: any[] = [];

    // Letterhead
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'DEPARTMENT OF THE ARMY',
            bold: true,
            font: 'Arial',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );
    children.push(
      new Paragraph({
        children: highlightPlaceholders(
          safeString(metadata.organization) || 'U.S. ARMY CORPS OF ENGINEERS',
        ),
        alignment: AlignmentType.CENTER,
        bold: true,
        spacing: { after: 100 },
      }),
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PORTLAND DISTRICT', font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'PO BOX 2946', font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 50 },
      }),
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'PORTLAND OR 97208-2946', font: 'Arial' }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: '_'.repeat(80), font: 'Arial' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );

    // Subject
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'SUBJECT: ', bold: true, font: 'Arial' }),
          ...highlightPlaceholders(safeString(content.title)),
        ],
        spacing: { after: 400 },
      }),
    );

    // Metadata table
    children.push(createMetadataTable(metadata));
    children.push(new Paragraph({ text: '', spacing: { after: 400 } }));

    // Sections
    safeArray<ContentSection>(content.sections).forEach((section) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: safeString(section?.heading),
              font: 'Arial',
              size: 26,
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
          border: {
            bottom: {
              color: '3498db',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        }),
      );

      const content = safeString(section?.content);
      const lines = content
        .split('\n')
        .filter((l: string) => l && l.trim().length > 0);

      if (section?.format === 'bullets') {
        lines.forEach((line) => {
          const cleanLine = line.replace(/^[•\-*]\s*/, '');
          children.push(
            new Paragraph({
              children: highlightPlaceholders(cleanLine),
              bullet: { level: 0 },
              spacing: { after: 100 },
            }),
          );
        });
      } else {
        const fullContent = lines.join(' ');
        children.push(
          new Paragraph({
            children: highlightPlaceholders(fullContent),
            spacing: { after: 150 },
          }),
        );
      }
    });

    // Action Items table
    const actionItems = safeArray<ActionItem>(content.action_items);
    if (actionItems.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Action Items',
              font: 'Arial',
              size: 26,
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
        }),
      );
      children.push(createActionItemsTable(actionItems));
      children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    // Decisions table
    const decisions = safeArray<Decision>(content.decisions);
    if (decisions.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Decisions',
              font: 'Arial',
              size: 26,
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
        }),
      );
      children.push(createDecisionsTable(decisions));
      children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    // Risks table
    const risks = safeArray<RiskIssue>(content.risks_issues);
    if (risks.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Risks and Issues',
              font: 'Arial',
              size: 26,
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
        }),
      );
      children.push(createRisksIssuesTable(risks));
      children.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    // Open Questions
    const openQuestions = safeArray<string>(content.open_questions);
    if (openQuestions.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Open Questions',
              font: 'Arial',
              size: 26,
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
        }),
      );

      openQuestions.forEach((question) => {
        children.push(
          new Paragraph({
            children: highlightPlaceholders(safeString(question)),
            bullet: { level: 0 },
            spacing: { after: 100 },
          }),
        );
      });
    }

    // Clarifications
    const clarifications = safeArray<string>(content.clarifications_needed);
    if (clarifications.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Clarifications Needed',
              font: 'Arial',
              size: 26,
              bold: true,
            }),
          ],
          spacing: { before: 400, after: 200 },
        }),
      );

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'The following items need clarification or additional information:',
              italics: true,
              font: 'Arial',
            }),
          ],
          spacing: { after: 200 },
        }),
      );

      clarifications.forEach((clarification) => {
        children.push(
          new Paragraph({
            children: highlightPlaceholders(safeString(clarification)),
            bullet: { level: 0 },
            spacing: { after: 100 },
          }),
        );
      });
    }

    // Signature
    if (metadata?.includeSignatureBlock) {
      children.push(new Paragraph({ text: '', spacing: { before: 800 } }));
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '________________________________',
              font: 'Arial',
            }),
          ],
          spacing: { after: 50 },
        }),
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: safeString(metadata.author) || '[Name]',
              font: 'Arial',
            }),
          ],
          spacing: { after: 50 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '[Title]', font: 'Arial' })],
          spacing: { after: 50 },
        }),
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Date: _________________', font: 'Arial' }),
          ],
        }),
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    console.log('Generated blob size:', blob.size);
    return blob;
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error(
      'Failed to generate Word document: ' +
        (error instanceof Error ? error.message : 'Unknown error'),
    );
  }
}

function createMetadataTable(metadata: any): Table {
  const rows: TableRow[] = [];

  if (metadata?.title) {
    rows.push(createMetadataRow('Meeting Title', safeString(metadata.title)));
  }
  if (metadata?.date) {
    rows.push(createMetadataRow('Date', safeString(metadata.date)));
  }
  if (metadata?.project) {
    rows.push(
      createMetadataRow('Project/Program', safeString(metadata.project)),
    );
  }
  if (
    metadata?.attendees &&
    Array.isArray(metadata.attendees) &&
    metadata.attendees.length > 0
  ) {
    const attendeeList = metadata.attendees
      .map((a: any) => safeString(a))
      .join(', ');
    rows.push(createMetadataRow('Attendees', attendeeList));
  }
  if (metadata?.author) {
    rows.push(createMetadataRow('Prepared By', safeString(metadata.author)));
  }
  if (metadata?.organization) {
    rows.push(
      createMetadataRow('Organization', safeString(metadata.organization)),
    );
  }

  if (rows.length === 0) {
    rows.push(createMetadataRow('Document', 'Meeting Notes'));
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows,
    borders: tableBorders,
  });
}

function createMetadataRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: safeString(label),
                bold: true,
                font: 'Arial',
              }),
            ],
          }),
        ],
        shading: { fill: 'E8E8E8' },
        margins: {
          top: 100,
          bottom: 100,
          left: 100,
          right: 100,
        },
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({ children: highlightPlaceholders(safeString(value)) }),
        ],
        margins: {
          top: 100,
          bottom: 100,
          left: 100,
          right: 100,
        },
      }),
    ],
  });
}

function createActionItemsTable(actionItems: ActionItem[]): Table {
  const items = safeArray<ActionItem>(actionItems);

  const headerRow = new TableRow({
    children: [
      createTableHeader('#', 5),
      createTableHeader('Action Item', 35),
      createTableHeader('Owner', 15),
      createTableHeader('Due Date', 15),
      createTableHeader('Notes', 30),
    ],
  });

  const dataRows = items.map((item, idx) => {
    return new TableRow({
      children: [
        createTableCell(String(idx + 1), 5),
        createTableCellWithHighlight(safeString(item?.description), 35),
        createTableCellWithHighlight(safeString(item?.owner), 15),
        createTableCellWithHighlight(safeString(item?.due_date), 15),
        createTableCellWithHighlight(safeString(item?.notes), 30),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: tableBorders,
  });
}

function createDecisionsTable(decisions: Decision[]): Table {
  const items = safeArray<Decision>(decisions);

  const headerRow = new TableRow({
    children: [
      createTableHeader('#', 10),
      createTableHeader('Decision', 45),
      createTableHeader('Context / Rationale', 45),
    ],
  });

  const dataRows = items.map((decision, idx) => {
    const context = safeString(decision?.context || decision?.rationale);
    return new TableRow({
      children: [
        createTableCell(String(idx + 1), 10),
        createTableCellWithHighlight(safeString(decision?.description), 45),
        createTableCellWithHighlight(context, 45),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: tableBorders,
  });
}

function createRisksIssuesTable(risks: RiskIssue[]): Table {
  const items = safeArray<RiskIssue>(risks);

  const headerRow = new TableRow({
    children: [
      createTableHeader('Type', 15),
      createTableHeader('Description', 35),
      createTableHeader('Impact', 25),
      createTableHeader('Mitigation', 25),
    ],
  });

  const dataRows = items.map((risk) => {
    return new TableRow({
      children: [
        createTableCell(risk?.type ? String(risk.type).toUpperCase() : '', 15),
        createTableCellWithHighlight(safeString(risk?.description), 35),
        createTableCellWithHighlight(safeString(risk?.impact), 25),
        createTableCellWithHighlight(safeString(risk?.mitigation), 25),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows],
    borders: tableBorders,
  });
}

function createTableHeader(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: safeString(text),
            bold: true,
            font: 'Arial',
            color: 'FFFFFF',
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
    ],
    shading: { fill: '4472C4' },
    margins: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
}

function createTableCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({
        children: [new TextRun({ text: safeString(text), font: 'Arial' })],
      }),
    ],
    margins: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
}

function createTableCellWithHighlight(
  text: string,
  widthPercent: number,
): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [
      new Paragraph({ children: highlightPlaceholders(safeString(text)) }),
    ],
    margins: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
}

export function generatePreviewHtml(content: RewrittenContent): string {
  const metadata = content?.metadata || {};
  const title = safeString(content?.title);
  const sections = safeArray<ContentSection>(content?.sections);
  const actionItems = safeArray<ActionItem>(content?.action_items);
  const decisions = safeArray<Decision>(content?.decisions);
  const risks = safeArray<RiskIssue>(content?.risks_issues);
  const openQuestions = safeArray<string>(content?.open_questions);
  const clarifications = safeArray<string>(content?.clarifications_needed);

  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333;">
        <p style="margin: 5px 0; font-weight: bold;">DEPARTMENT OF THE ARMY</p>
        <p style="margin: 5px 0; font-weight: bold;">${(safeString(metadata.organization) || 'U.S. ARMY CORPS OF ENGINEERS').replace(/(\[[^\]]+\])/g, '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>')}</p>
        <p style="margin: 5px 0;">PORTLAND DISTRICT</p>
        <p style="margin: 5px 0;">PO BOX 2946</p>
        <p style="margin: 5px 0;">PORTLAND OR 97208-2946</p>
      </div>

      <p style="margin: 20px 0;"><strong>SUBJECT:</strong> ${title.replace(/(\[[^\]]+\])/g, '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>')}</p>
  `;

  html +=
    '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
  if (metadata?.title) {
    const highlightedTitle = safeString(metadata.title).replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );
    html += `<tr><td style="background: #E8E8E8; padding: 8px; font-weight: bold; width: 30%; border: 1px solid #ddd;">Meeting Title</td><td style="padding: 8px; border: 1px solid #ddd;">${highlightedTitle}</td></tr>`;
  }
  if (metadata?.date) {
    const highlightedDate = safeString(metadata.date).replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );
    html += `<tr><td style="background: #E8E8E8; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Date</td><td style="padding: 8px; border: 1px solid #ddd;">${highlightedDate}</td></tr>`;
  }
  if (metadata?.project) {
    const highlightedProject = safeString(metadata.project).replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );
    html += `<tr><td style="background: #E8E8E8; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Project/Program</td><td style="padding: 8px; border: 1px solid #ddd;">${highlightedProject}</td></tr>`;
  }
  if (
    metadata?.attendees &&
    Array.isArray(metadata.attendees) &&
    metadata.attendees.length > 0
  ) {
    const attendeeList = metadata.attendees
      .map((a: any) => safeString(a))
      .join(', ');
    const highlightedAttendees = attendeeList.replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );
    html += `<tr><td style="background: #E8E8E8; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Attendees</td><td style="padding: 8px; border: 1px solid #ddd;">${highlightedAttendees}</td></tr>`;
  }
  if (metadata?.author) {
    const highlightedAuthor = safeString(metadata.author).replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );
    html += `<tr><td style="background: #E8E8E8; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Prepared By</td><td style="padding: 8px; border: 1px solid #ddd;">${highlightedAuthor}</td></tr>`;
  }
  if (metadata?.organization) {
    const highlightedOrg = safeString(metadata.organization).replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );
    html += `<tr><td style="background: #E8E8E8; padding: 8px; font-weight: bold; border: 1px solid #ddd;">Organization</td><td style="padding: 8px; border: 1px solid #ddd;">${highlightedOrg}</td></tr>`;
  }
  html += '</table>';

  sections.forEach((section) => {
    const heading = safeString(section?.heading);
    const content = safeString(section?.content);
    html += `<h2 style="color: #2c3e50; margin-top: 30px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">${heading}</h2>`;
    const highlightedContent = content.replace(
      /(\[[^\]]+\])/g,
      '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
    );

    if (section?.format === 'bullets') {
      const lines = content
        .split('\n')
        .filter((l: string) => l && l.trim().length > 0);
      html += '<ul>';
      lines.forEach((line) => {
        const cleanLine = line.replace(/^[•\-*]\s*/, '');
        const highlighted = cleanLine.replace(
          /(\[[^\]]+\])/g,
          '<span style="background-color: yellow; font-weight: bold; padding: 2px 4px;">$1</span>',
        );
        html += `<li style="margin: 8px 0;">${highlighted}</li>`;
      });
      html += '</ul>';
    } else {
      html += `<p style="line-height: 1.6; margin: 15px 0;">${highlightedContent.replace(/\n/g, ' ')}</p>`;
    }
  });

  if (actionItems.length > 0) {
    html += '<h2 style="color: #2c3e50; margin-top: 30px;">Action Items</h2>';
    html +=
      '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
    html +=
      '<tr style="background: #4472C4; color: white;"><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">#</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Action Item</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Owner</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Due Date</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Notes</th></tr>';
    actionItems.forEach((item, idx) => {
      const desc = safeString(item?.description).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      const owner = safeString(item?.owner).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      const due = safeString(item?.due_date).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${idx + 1}</td><td style="padding: 8px; border: 1px solid #ddd;">${desc}</td><td style="padding: 8px; border: 1px solid #ddd;">${owner}</td><td style="padding: 8px; border: 1px solid #ddd;">${due}</td><td style="padding: 8px; border: 1px solid #ddd;">${safeString(item?.notes)}</td></tr>`;
    });
    html += '</table>';
  }

  if (decisions.length > 0) {
    html += '<h2 style="color: #2c3e50; margin-top: 30px;">Decisions</h2>';
    html +=
      '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
    html +=
      '<tr style="background: #4472C4; color: white;"><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">#</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Decision</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Context / Rationale</th></tr>';
    decisions.forEach((decision, idx) => {
      const desc = safeString(decision?.description).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      const context = safeString(
        decision?.context || decision?.rationale,
      ).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${idx + 1}</td><td style="padding: 8px; border: 1px solid #ddd;">${desc}</td><td style="padding: 8px; border: 1px solid #ddd;">${context}</td></tr>`;
    });
    html += '</table>';
  }

  if (risks.length > 0) {
    html +=
      '<h2 style="color: #2c3e50; margin-top: 30px;">Risks and Issues</h2>';
    html +=
      '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
    html +=
      '<tr style="background: #4472C4; color: white;"><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Type</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Impact</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Mitigation</th></tr>';
    risks.forEach((risk) => {
      const desc = safeString(risk?.description).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      const type = risk?.type ? String(risk.type).toUpperCase() : '';
      html += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${type}</td><td style="padding: 8px; border: 1px solid #ddd;">${desc}</td><td style="padding: 8px; border: 1px solid #ddd;">${safeString(risk?.impact)}</td><td style="padding: 8px; border: 1px solid #ddd;">${safeString(risk?.mitigation)}</td></tr>`;
    });
    html += '</table>';
  }

  if (openQuestions.length > 0) {
    html +=
      '<h2 style="color: #2c3e50; margin-top: 30px;">Open Questions</h2><ul>';
    openQuestions.forEach((q) => {
      const highlighted = safeString(q).replace(
        /(\[[^\]]+\])/g,
        '<span style="background-color: yellow; font-weight: bold;">$1</span>',
      );
      html += `<li style="margin: 8px 0;">${highlighted}</li>`;
    });
    html += '</ul>';
  }

  if (clarifications.length > 0) {
    html +=
      '<div style="background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0;"><h3 style="color: #856404; margin-top: 0;">Clarifications Needed</h3><ul>';
    clarifications.forEach((c) => {
      html += `<li style="margin: 8px 0; color: #856404;"><strong>${safeString(c)}</strong></li>`;
    });
    html += '</ul></div>';
  }

  if (metadata?.includeSignatureBlock) {
    html += `
      <div style="margin-top: 60px;">
        <p>________________________________</p>
        <p>${safeString(metadata.author) || '[Name]'}</p>
        <p>[Title]</p>
        <p>Date: _________________</p>
      </div>
    `;
  }

  html += '</div>';
  return html;
}
