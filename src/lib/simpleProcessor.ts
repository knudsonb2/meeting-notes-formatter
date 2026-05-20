import {
  TemplateStructure,
  MeetingMetadata,
  RewrittenContent,
  ActionItem,
  Decision,
  RiskIssue,
  ContentSection,
} from '@/types/documents';

export function processNotesSimple(
  templateStructure: TemplateStructure,
  rawNotes: string,
  metadata: MeetingMetadata,
): RewrittenContent {
  const lines = rawNotes
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Extract structured data
  const decisions: Decision[] = [];
  const actionItems: ActionItem[] = [];
  const risks: RiskIssue[] = [];
  const openQuestions: string[] = [];
  const discussionPoints: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();

    // Decisions
    if (
      lowerLine.includes('decision:') ||
      lowerLine.includes('decided:') ||
      lowerLine.includes('agreed to')
    ) {
      decisions.push({
        description: cleanLine.replace(/decision:?/i, '').trim(),
        context: 'From meeting notes',
      });
    }
    // Action items
    else if (
      lowerLine.includes('action:') ||
      lowerLine.includes('todo:') ||
      lowerLine.includes(' will ') ||
      lowerLine.includes(' to ')
    ) {
      const ownerMatch = line.match(/(\w+)\s+(?:will|to|should)/i);
      const dateMatch = line.match(
        /by\s+(\w+\s+\d+|friday|monday|tuesday|wednesday|thursday|next week|end of week)/i,
      );

      actionItems.push({
        description: cleanLine.replace(/action:?|todo:?/i, '').trim(),
        owner: ownerMatch ? ownerMatch[1] : '[Owner TBD]',
        due_date: dateMatch ? dateMatch[1] : '[Date TBD]',
      });
    }
    // Risks and Issues
    else if (
      lowerLine.includes('risk:') ||
      lowerLine.includes('issue:') ||
      lowerLine.includes('concern:') ||
      lowerLine.includes('problem:')
    ) {
      risks.push({
        type: lowerLine.includes('risk') ? 'risk' : 'issue',
        description: cleanLine
          .replace(/(risk|issue|concern|problem):?/i, '')
          .trim(),
      });
    }
    // Questions
    else if (line.includes('?')) {
      openQuestions.push(cleanLine);
    }
    // Regular discussion points
    else if (cleanLine.length > 10) {
      discussionPoints.push(cleanLine);
    }
  }

  // Build sections based on template
  const sections: ContentSection[] = [];

  for (const templateSection of templateStructure.sections) {
    const heading = templateSection.heading;
    let content = '';

    // Match content to appropriate sections
    if (
      heading.toLowerCase().includes('purpose') ||
      heading.toLowerCase().includes('objective')
    ) {
      content =
        discussionPoints.length > 0
          ? discussionPoints[0]
          : 'Meeting purpose not specified in notes.';
    } else if (
      heading.toLowerCase().includes('summary') ||
      heading.toLowerCase().includes('overview')
    ) {
      const summary = discussionPoints.slice(0, 3).join('\n\n');
      content = summary || 'No summary available.';
    } else if (
      heading.toLowerCase().includes('discussion') ||
      heading.toLowerCase().includes('notes')
    ) {
      content = discussionPoints
        .map((point, idx) => `${idx + 1}. ${point}`)
        .join('\n\n');
    } else if (heading.toLowerCase().includes('decision')) {
      if (decisions.length > 0) {
        content = 'See Decisions table below.';
      } else {
        content = 'No decisions recorded.';
      }
    } else if (heading.toLowerCase().includes('action')) {
      if (actionItems.length > 0) {
        content = 'See Action Items table below.';
      } else {
        content = 'No action items recorded.';
      }
    } else if (
      heading.toLowerCase().includes('risk') ||
      heading.toLowerCase().includes('issue')
    ) {
      if (risks.length > 0) {
        content = 'See Risks and Issues table below.';
      } else {
        content = 'No risks or issues identified.';
      }
    } else if (heading.toLowerCase().includes('question')) {
      if (openQuestions.length > 0) {
        content = openQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
      } else {
        content = 'No open questions.';
      }
    } else if (heading.toLowerCase().includes('next step')) {
      const nextSteps = actionItems
        .slice(0, 5)
        .map((item) => `• ${item.description}`)
        .join('\n');
      content = nextSteps || 'Next steps to be determined.';
    } else {
      // Generic content
      content =
        discussionPoints.slice(0, 2).join('\n\n') ||
        'Content not specified in notes.';
    }

    sections.push({
      heading: heading,
      content: content,
      format: templateSection.format,
    });
  }

  return {
    title: metadata.title || 'Meeting Notes',
    metadata: metadata,
    sections: sections,
    action_items: actionItems,
    decisions: decisions,
    risks_issues: risks,
    open_questions: openQuestions,
    clarifications_needed: [],
  };
}
