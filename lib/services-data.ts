export type IllustrationKey = "operations" | "automation" | "dashboards" | "projects" | "email" | "website" | "about" | "contact" | "opspilot" | "pro" | "portfolio" | "faq" | "legal" | "thanks";

export type Block =
  | { t: "p"; v: string }
  | { t: "ul"; v: string[] }
  | { t: "ol"; v: string[] }
  | { t: "dl"; v: { name: string; text?: string; bullets?: string[] }[] };
export type Section = { heading: string; blocks: Block[] };

export type ServiceItem = {
  slug: string;
  title: string;
  formLabel: string;
  short: string;
  overview: { tagline: string; intro: string; work: string[]; ideal: string };
  heroTitle: string;
  heroText: string;
  heroCta: string;
  illustration: IllustrationKey;
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  sections: Section[];
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalCta: string;
};

const p = (v: string): Block => ({ t: "p", v });
const ul = (...v: string[]): Block => ({ t: "ul", v });
const ol = (...v: string[]): Block => ({ t: "ol", v });
const dl = (...v: { name: string; text?: string; bullets?: string[] }[]): Block => ({ t: "dl", v });

export const SERVICES: ServiceItem[] = [
  {
    slug: "business-operations-setup",
    title: "Business Operations Setup",
    formLabel: "Business Operations Setup",
    short: "Create a more organised business through process documentation, SOPs, workflow design and operational structures.",
    overview: {
      tagline: "Organise the way your business works.",
      intro: "We help businesses document their processes, define responsibilities and establish practical workflows.",
      work: ["SOP development", "Business process mapping", "Workflow documentation", "Roles and responsibilities", "Operational checklists", "Internal reporting structures", "Process improvement recommendations"],
      ideal: "Businesses experiencing inconsistent processes, unclear responsibilities or growing operational complexity.",
    },
    heroTitle: "Build a Business That Runs on Clear Processes.",
    heroText: "We help businesses replace informal ways of working with documented procedures, structured workflows and clearer operational responsibilities.",
    heroCta: "Improve My Business Operations",
    illustration: "operations",
    imageAlt: "Illustration of a business process map with connected steps and a decision point above a standard operating procedure checklist",
    seoTitle: "Business Operations Setup and Process Documentation",
    seoDescription: "Improve business operations with SOPs, process mapping, workflow design, responsibility structures and operational documentation.",
    sections: [
      { heading: "The business challenge", blocks: [
        p("A business can have capable employees and still struggle with operational consistency."),
        p("One employee may complete a task differently from another. Important activities may depend on verbal instructions. Managers may repeatedly explain the same procedures. When a key employee is absent, routine work may become difficult to continue."),
        p("These challenges often indicate that the business needs stronger operational documentation and process structures."),
        p("A process should not exist only in someone's memory. It should be understandable, documented and accessible to the people responsible for executing it."),
      ] },
      { heading: "What we do", blocks: [
        p("OptiFlow helps businesses understand how their operations currently work and develop structured processes that make responsibilities and procedures clearer."),
        p("We focus on documenting important activities, identifying process gaps and establishing practical workflows. Our objective is to help the business create a more consistent operating environment."),
      ] },
      { heading: "Our deliverables", blocks: [dl(
        { name: "1. Business Process Assessment", text: "We review selected operational activities to understand how tasks are currently performed. This may include:", bullets: ["Identifying major processes", "Understanding task dependencies", "Reviewing existing documents", "Identifying repeated operational difficulties", "Highlighting opportunities for improvement"] },
        { name: "2. Standard Operating Procedures", text: "We create written procedures explaining how recurring tasks should be performed. An SOP may contain:", bullets: ["Purpose", "Scope", "Responsible role", "Required materials or information", "Step-by-step instructions", "Expected output", "Escalation requirements", "Review and approval responsibilities"] },
        { name: "3. Workflow Documentation", text: "We map how information and activities move between people, departments and systems." },
        { name: "4. Roles and Responsibilities", text: "We help clarify ownership of selected operational activities and establish practical responsibility structures." },
        { name: "5. Operational Checklists", text: "We develop repeatable checklists for recurring business activities such as opening procedures, customer onboarding, service delivery and reporting." },
        { name: "6. Process Improvement Recommendations", text: "We identify unnecessary steps, repeated work, unclear handovers and opportunities for better coordination." },
      )] },
      { heading: "Example: customer onboarding process", blocks: [
        p("A business receives a new customer but has no standard onboarding procedure. Different employees request different information. Important details are sometimes missed. The business owner has to repeatedly intervene."),
        p("We can help establish a documented process:"),
        ol("Receive customer enquiry.", "Record customer information.", "Confirm service requirements.", "Send the relevant proposal or information.", "Confirm acceptance.", "Collect required onboarding details.", "Assign the responsible team member.", "Begin service delivery.", "Confirm onboarding completion."),
        p("The process can then be documented, assigned and monitored."),
      ] },
      { heading: "Our implementation process", blocks: [dl(
        { name: "Discovery", text: "Understand the business and selected operational activities." },
        { name: "Process Review", text: "Examine existing workflows and documentation." },
        { name: "Design", text: "Develop the required SOPs, process maps and responsibility structures." },
        { name: "Validation", text: "Review the documents with the relevant business representatives." },
        { name: "Handover", text: "Deliver the approved documents and explain their use." },
        { name: "Improvement", text: "Identify areas that may require future updates." },
      )] },
      { heading: "Who needs this service?", blocks: [ul("Businesses experiencing inconsistent service delivery", "Companies with growing employee numbers", "Businesses dependent on informal instructions", "Organisations preparing to delegate more responsibilities", "Training and consulting businesses", "Businesses preparing for operational expansion")] },
      { heading: "What you should expect", blocks: [
        p("The outcome is a clearer understanding of how selected business activities should be performed."),
        p("Depending on the agreed scope, you receive documented procedures, workflow descriptions, checklists and recommendations."),
        p("This service does not automatically guarantee that employees will follow every procedure. Successful implementation also requires management support, communication and adoption."),
      ] },
    ],
    faq: [
      { q: "Do you develop SOPs from scratch?", a: "Yes. We can develop SOPs using information gathered from your business processes and relevant stakeholders." },
      { q: "Can you improve existing SOPs?", a: "Yes. Existing documentation can be reviewed and updated based on the agreed scope." },
      { q: "Do you provide employee training?", a: "Process handover and agreed implementation guidance can be included. Broader employee training should be defined separately." },
      { q: "Can you document all departments?", a: "Yes, subject to a defined project scope and agreed deliverables." },
    ],
    finalTitle: "Let's Make Your Business Processes Clearer and Easier to Manage.",
    finalCta: "Request Operations Setup",
  },
  {
    slug: "workflow-automation",
    title: "Workflow Automation",
    formLabel: "Workflow Automation",
    short: "Connect business applications and automate repetitive tasks, notifications, data collection and follow-up processes.",
    overview: {
      tagline: "Reduce repetitive work through connected systems.",
      intro: "We help businesses automate routine activities by connecting supported applications and designing workflows around their processes.",
      work: ["Lead capture", "Automated notifications", "Follow-up reminders", "Task creation", "Form and spreadsheet integration", "Email automation", "Make.com and Zapier implementation"],
      ideal: "Businesses that repeat the same administrative activities and want more consistent workflows.",
    },
    heroTitle: "Stop Repeating Tasks That Your Systems Can Handle.",
    heroText: "We help businesses reduce repetitive administrative work through practical automation that connects their tools, information and workflows.",
    heroCta: "Automate My Business Processes",
    illustration: "automation",
    imageAlt: "Illustration of a central automation hub connected to email, spreadsheet, notification and calendar tools",
    seoTitle: "Business Workflow Automation Services",
    seoDescription: "Automate repetitive business tasks, lead capture, notifications, follow-ups and application integrations using practical workflow automation.",
    sections: [
      { heading: "The problem", blocks: [
        p("Think about how much time your business spends on activities such as:"),
        ul("Copying information from forms into spreadsheets", "Sending routine notification emails", "Reminding employees about pending tasks", "Following up with new enquiries", "Updating records across different applications", "Transferring information between tools"),
        p("These activities may seem small individually, but they can consume considerable time when repeated every day. They also create opportunities for missed updates and manual errors."),
      ] },
      { heading: "Our approach", blocks: [
        p("We first understand the process before automating it. Automation is not useful if it simply makes a poorly designed process happen faster."),
        p("We examine the existing workflow, identify unnecessary manual steps and determine which activities can be reliably automated. We then configure the relevant tools, test the workflow and provide documentation."),
      ] },
      { heading: "What we can automate", blocks: [dl(
        { name: "Lead Capture", text: "Automatically collect information from supported enquiry forms and transfer it into a central spreadsheet or business system." },
        { name: "Email Notifications", text: "Send notifications when selected business events occur." },
        { name: "Task Creation", text: "Create tasks automatically when a form is submitted or a specified activity takes place." },
        { name: "Customer Follow-ups", text: "Set up reminders or notification workflows to help teams respond to enquiries consistently." },
        { name: "Data Transfer", text: "Connect supported applications so that information does not have to be repeatedly entered manually." },
        { name: "Internal Alerts", text: "Notify responsible team members when important activities require attention." },
      )] },
      { heading: "Example: automated lead management", blocks: [
        p("Imagine that a customer submits an enquiry through your website. Without automation, someone may need to:"),
        ul("Open the enquiry", "Copy the customer's details", "Enter the information into a spreadsheet", "Notify the sales representative", "Remember to follow up"),
        p("With a properly configured workflow:"),
        ol("The form receives the enquiry.", "The customer's details are captured.", "The information is added to the designated lead register.", "A notification is sent to the responsible person.", "A follow-up task or reminder is generated where supported.", "The lead is monitored through its agreed status."),
        p("This creates a more consistent process for handling new enquiries."),
      ] },
      { heading: "Tools we work with", blocks: [
        p("Depending on your requirements, we can work with:"),
        ul("Make.com", "Zapier", "Google Sheets", "Microsoft Excel", "Google Forms", "Supported email platforms", "ClickUp and other supported task management applications", "APIs and integrations where technically appropriate"),
        p("Tool selection depends on your current systems, subscription access and workflow requirements."),
      ] },
      { heading: "Our implementation process", blocks: [dl(
        { name: "1. Workflow Discovery", text: "We understand the task and why it is currently performed manually." },
        { name: "2. Process Mapping", text: "We identify the trigger, actions, conditions and expected outcome." },
        { name: "3. Tool Selection", text: "We determine which supported applications are appropriate." },
        { name: "4. Configuration", text: "We build the automation and connect the relevant applications." },
        { name: "5. Testing", text: "We test normal scenarios, incomplete information and possible errors." },
        { name: "6. Documentation", text: "We explain how the automation works and what to do when an issue occurs." },
      )] },
      { heading: "Who needs this service?", blocks: [ul("Businesses processing repeated customer enquiries", "Online retailers managing order information", "Training businesses coordinating registrations", "Consultants managing client follow-ups", "Teams that repeatedly update spreadsheets", "Businesses that need consistent internal notifications")] },
      { heading: "Important considerations", blocks: [
        p("Automation depends on third-party platforms, available integrations, account permissions and subscription limits."),
        p("Some workflows require paid application subscriptions or custom development. These costs will be identified before implementation."),
      ] },
    ],
    faq: [
      { q: "Can you automate my existing Google Sheets workflow?", a: "Yes, if the required workflow can be supported by the available integrations and account permissions." },
      { q: "Can you connect my website form to email and spreadsheets?", a: "Yes, where the website and relevant platforms support the required integration." },
      { q: "Will automation eliminate all manual work?", a: "No. Some decisions, approvals and exception handling should remain under human control." },
      { q: "Can you maintain an existing automation?", a: "We can assess and support existing workflows under an agreed maintenance scope." },
    ],
    finalTitle: "Let's Find the Repetitive Work Your Business Can Stop Doing Manually.",
    finalCta: "Request Workflow Automation",
  },
  {
    slug: "dashboards-and-reporting",
    title: "Dashboards and Business Reporting",
    formLabel: "Dashboards and Business Reporting",
    short: "Understand your business performance through organised data, customised dashboards and management reports.",
    overview: {
      tagline: "Understand what is happening in your business.",
      intro: "We build customised dashboards and reporting systems that organise important business information.",
      work: ["Excel dashboards", "Google Sheets dashboards", "KPI monitoring", "Sales reports", "Expense tracking", "Operational reports", "Project performance reports"],
      ideal: "Business owners and managers who need better visibility into performance.",
    },
    heroTitle: "Know What Is Happening in Your Business. Make Better Decisions.",
    heroText: "We help businesses organise their information into dashboards and reports that make important performance indicators easier to understand.",
    heroCta: "Build My Business Dashboard",
    illustration: "dashboards",
    imageAlt: "Illustration of a business dashboard with key figure tiles, a bar chart, a line chart and a donut chart",
    seoTitle: "Business Dashboards and Reporting Solutions",
    seoDescription: "Monitor business performance with customised Excel and Google Sheets dashboards, KPI reports, sales tracking and expense reporting.",
    sections: [
      { heading: "The challenge", blocks: [
        p("Many businesses collect large amounts of information without having a clear reporting structure."),
        p("Sales records may be scattered across different spreadsheets. Expenses may be recorded inconsistently. Managers may have to request updates from multiple employees before understanding performance."),
        p("A business should be able to answer important questions without spending hours manually preparing reports. Examples include:"),
        ul("How much revenue did we generate this month?", "What are our major expenses?", "How many new enquiries did we receive?", "How many enquiries became customers?", "Which projects are behind schedule?", "Which operational activities require attention?"),
      ] },
      { heading: "Our solution", blocks: [
        p("We develop reporting systems that organise relevant business data and present it through structured reports and dashboards."),
        p("Our focus is on helping decision-makers see the information that matters to their operations."),
      ] },
      { heading: "What we deliver", blocks: [dl(
        { name: "1. Sales Dashboards", text: "Monitor sales performance using agreed indicators such as:", bullets: ["Total sales", "Number of transactions", "Sales by product or service", "Monthly sales trends", "Outstanding payments"] },
        { name: "2. Expense Dashboards", text: "Organise business expenses and monitor spending categories." },
        { name: "3. KPI Dashboards", text: "Track selected performance indicators against agreed targets." },
        { name: "4. Operational Reports", text: "Monitor activities such as task completion, service delivery, customer enquiries and operational performance." },
        { name: "5. Project Dashboards", text: "Monitor project milestones, task statuses, overdue activities and progress." },
        { name: "6. Management Reports", text: "Prepare structured reporting formats that make information easier for managers and business owners to review." },
      )] },
      { heading: "Example: monthly business performance dashboard", blocks: [
        p("A business wants to understand its monthly performance. We may develop a dashboard with:"),
        ul("Monthly revenue", "Monthly expenses", "Net operating result based on supplied data", "Number of new customers", "Outstanding payments", "Sales by service category", "Month-on-month comparisons"),
        p("The dashboard can include filters and charts where appropriate. The exact indicators depend on the available data and business requirements."),
      ] },
      { heading: "Our tools", blocks: [ul("Microsoft Excel", "Google Sheets", "Pivot Tables", "Spreadsheet formulas", "Data validation", "Charts and visual reports", "Supported data integrations")] },
      { heading: "Implementation process", blocks: [ol("Understand the reporting questions.", "Review existing data sources.", "Identify required indicators.", "Organise the data structure.", "Build calculations and dashboard views.", "Validate results against source records.", "Provide documentation and handover.")] },
      { heading: "Who needs this service?", blocks: [ul("Small business owners", "Finance and administrative teams", "Sales teams", "Operations managers", "Project managers", "Training and service businesses", "Businesses using spreadsheets without a structured reporting system")] },
      { heading: "What makes a useful dashboard?", blocks: [
        p("A good dashboard should not simply contain attractive charts. It should:"),
        ul("Answer relevant business questions", "Use clearly defined metrics", "Present accurate information", "Make trends easier to identify", "Support appropriate decisions", "Be understandable to its intended users"),
      ] },
    ],
    faq: [
      { q: "Can you build dashboards using our existing spreadsheet?", a: "Yes. We can review your existing data and determine whether it can support the required dashboard." },
      { q: "Can you automate dashboard updates?", a: "Where the data source and available integrations permit, we can configure automated updates." },
      { q: "Do you provide financial accounting services?", a: "Our service focuses on organising and reporting business information. It does not replace professional accounting, auditing or tax advice." },
      { q: "Can you create a dashboard for multiple departments?", a: "Yes, depending on the availability and structure of the required data." },
    ],
    finalTitle: "Turn Your Business Information Into Useful Management Reports.",
    finalCta: "Request a Dashboard",
  },
  {
    slug: "project-management",
    title: "Project Management and Coordination",
    formLabel: "Project Management and Coordination",
    short: "Improve execution by organising projects, assigning responsibilities, tracking deadlines and monitoring deliverables.",
    overview: {
      tagline: "Make projects easier to plan, manage and monitor.",
      intro: "We help businesses establish systems for managing tasks, deadlines, responsibilities and deliverables.",
      work: ["Project schedules", "Task management", "Project workspace configuration", "Milestone tracking", "Progress reporting", "Team coordination", "Project documentation"],
      ideal: "Businesses managing multiple projects, teams or recurring deliverables.",
    },
    heroTitle: "Keep Projects Organised. Keep Responsibilities Clear. Keep Work Moving.",
    heroText: "We help businesses establish project management systems that make it easier to plan activities, assign responsibilities, track deadlines and monitor progress.",
    heroCta: "Improve My Project Management",
    illustration: "projects",
    imageAlt: "Illustration of a project task board with columns for to do, in progress and done, and a progress bar",
    seoTitle: "Project Management and Coordination Services",
    seoDescription: "Organise projects, track tasks, manage deadlines and improve team coordination with practical project management systems.",
    sections: [
      { heading: "The challenge", blocks: [
        p("Projects often struggle because the people involved do not have a shared understanding of what needs to happen."),
        p("Tasks are discussed in meetings but not properly recorded. Deadlines are missed. Employees are unsure who owns specific deliverables. Managers struggle to obtain reliable progress updates."),
        p("These challenges can affect delivery timelines, resource allocation and customer expectations."),
      ] },
      { heading: "Our solution", blocks: [
        p("We help businesses establish project management structures that bring tasks, responsibilities, timelines and reporting into a more organised environment."),
        p("We work with your project requirements and select tools appropriate to the size and complexity of the work."),
      ] },
      { heading: "What we deliver", blocks: [dl(
        { name: "Project Planning", text: "Break down project objectives into activities, milestones and deliverables." },
        { name: "Project Scheduling", text: "Organise activities into practical timelines and identify dependencies." },
        { name: "Task Management Systems", text: "Configure workspaces that help teams record, assign and monitor tasks." },
        { name: "Responsibility Structures", text: "Clarify ownership and accountability for selected deliverables." },
        { name: "Progress Monitoring", text: "Create reporting structures that show completed tasks, pending work and potential blockers." },
        { name: "Project Documentation", text: "Organise important project information, decisions and reference documents." },
        { name: "Project Coordination Support", text: "Where agreed, support communication, follow-ups and progress monitoring across project participants." },
      )] },
      { heading: "Example: business website development project", blocks: [
        p("A business wants to develop a new website. Without proper coordination, the design, content, development and approval activities may become disorganised. We can structure the project into:"),
        ol("Requirements gathering", "Website structure", "Content preparation", "Design", "Development", "Integration", "Testing", "Client review", "Deployment", "Handover"),
        p("Each activity can have a responsible person, deadline and completion status."),
      ] },
      { heading: "Tools we work with", blocks: [ul("ClickUp", "Trello", "Asana", "Jira", "Microsoft Project", "Google Sheets", "Other suitable project management tools")] },
      { heading: "Implementation process", blocks: [ol("Understand project objectives.", "Identify key deliverables.", "Break down work into activities.", "Define responsibilities.", "Establish milestones and deadlines.", "Configure the project management workspace.", "Create reporting and monitoring structures.", "Provide handover and usage guidance.")] },
      { heading: "Who needs this service?", blocks: [ul("Businesses managing multiple projects", "Consulting firms", "Training and event businesses", "Project-based service providers", "Growing teams", "Organisations experiencing delays and poor task visibility")] },
    ],
    faq: [
      { q: "Can you set up ClickUp for my business?", a: "Yes. We can configure workspaces, tasks, statuses and reporting structures based on your requirements." },
      { q: "Do you manage projects on behalf of clients?", a: "Project coordination and monitoring can be provided where explicitly included in the engagement." },
      { q: "Can you migrate tasks from another platform?", a: "We can assess migration options based on the source platform, data structure and available tools." },
      { q: "Will you provide employee training?", a: "Handover and agreed system guidance can be included. Extended training can be separately scoped." },
    ],
    finalTitle: "Let's Give Your Projects a Better Management Structure.",
    finalCta: "Request Project Management Support",
  },
  {
    slug: "business-email-and-it-support",
    title: "Business Email and IT Systems Support",
    formLabel: "Business Email and IT Support",
    short: "Establish professional business email, domain infrastructure and essential digital systems.",
    overview: {
      tagline: "Establish a professional digital foundation.",
      intro: "We help businesses configure and manage essential business email and domain infrastructure.",
      work: ["Domain registration support", "Zoho Business Email", "DNS configuration", "Business email setup", "Email signatures", "Account configuration", "Basic technical support"],
      ideal: "Businesses that need professional email and reliable digital infrastructure.",
    },
    heroTitle: "Give Your Business a Professional Digital Foundation.",
    heroText: "We help businesses establish professional email accounts, configure domains and organise essential digital infrastructure using practical third-party solutions.",
    heroCta: "Set Up My Business Email",
    illustration: "email",
    imageAlt: "Illustration of a business email inbox beside an envelope with a verified badge representing a professional company email address",
    seoTitle: "Business Email and IT Systems Support",
    seoDescription: "Establish professional business email, domain configuration and essential digital infrastructure with OptiFlow.",
    sections: [
      { heading: "The challenge", blocks: [
        p("Business communication is an important part of how customers and partners experience your organisation."),
        p("Using personal email addresses for business activities may create an inconsistent professional identity. Poorly configured email accounts and domain settings can also cause delivery and access problems."),
        p("Businesses need an email environment that is properly configured, accessible and aligned with their communication requirements."),
      ] },
      { heading: "Our solution", blocks: [
        p("OptiFlow helps businesses establish professional email infrastructure using Zoho Business Email and domain registration through Namecheap."),
        p("We support the configuration process, account setup and basic technical administration within the agreed scope."),
      ] },
      { heading: "What we deliver", blocks: [dl(
        { name: "Domain Registration Support", text: "We help clients select and register suitable domains, subject to availability and agreed costs." },
        { name: "Business Email Setup", text: "We configure business email accounts using the selected Zoho subscription." },
        { name: "Domain and DNS Configuration", text: "We assist with the necessary domain records and verification requirements." },
        { name: "Email Account Configuration", text: "We set up the agreed accounts and help configure access on supported devices and applications." },
        { name: "Professional Email Signatures", text: "We create consistent email signature formats using approved company information." },
        { name: "Basic Email Troubleshooting", text: "We assist with common configuration and access problems within the agreed support scope." },
        { name: "Renewal Monitoring", text: "We maintain agreed records of relevant subscription expiry dates and provide reminders ahead of renewal." },
      )] },
      { heading: "Our implementation process", blocks: [ol("Confirm the business domain requirements.", "Check domain availability.", "Agree on the appropriate domain and email subscriptions.", "Register or connect the domain.", "Configure the required DNS records.", "Set up the agreed email accounts.", "Test email sending and receiving.", "Provide handover information.")] },
      { heading: "Who needs this service?", blocks: [ul("New businesses establishing a professional identity", "Companies using personal email for business communication", "Businesses creating email accounts for employees", "Organisations that need domain configuration support", "Businesses that want their domain and email subscriptions monitored")] },
      { heading: "Important service conditions", blocks: [
        p("Domain registration and email services rely on third-party providers."),
        p("The actual storage capacity, account limits, security features and subscription terms depend on the plan selected."),
        p("Domain availability and registration costs may change."),
        p("Clients should retain appropriate ownership and access to their domain and business email accounts."),
      ] },
    ],
    faq: [
      { q: "Which email platform do you use?", a: "Our implementation uses Zoho Business Email, subject to the selected subscription." },
      { q: "Which domain registrar do you use?", a: "We use Namecheap for domain registration support." },
      { q: "Can I use my existing domain?", a: "Yes. We can assess the domain and configure the required email settings if access and technical conditions permit." },
      { q: "Can you create email accounts for employees?", a: "Yes, within the account limits and subscription scope agreed with the client." },
      { q: "Do you automatically renew domains and subscriptions?", a: "No. We monitor expiry dates and send reminders. Renewals require client approval and payment." },
    ],
    finalTitle: "Let's Establish Professional Business Email for Your Organisation.",
    finalCta: "Request Business Email Setup",
  },
  {
    slug: "website-and-digital-solutions",
    title: "Website and Digital Solutions",
    formLabel: "Website and Digital Solutions",
    short: "Build a professional online presence with responsive websites, contact forms and useful digital integrations.",
    overview: {
      tagline: "Give your business a professional online presence.",
      intro: "We develop business websites and practical integrations that help customers understand your services and contact your business.",
      work: ["Website design and development", "Responsive layouts", "Business and service pages", "Contact forms", "WhatsApp integration", "Basic SEO", "Website deployment", "Agreed maintenance"],
      ideal: "Businesses that need a professional website or improved online presence.",
    },
    heroTitle: "Your Website Should Do More Than Look Good. It Should Help Your Business Work.",
    heroText: "We design and develop professional business websites that communicate your services, build credibility and make it easier for customers to contact you.",
    heroCta: "Build My Business Website",
    illustration: "website",
    imageAlt: "Illustration of a responsive business website on a desktop browser next to the same site on a mobile phone",
    seoTitle: "Business Website Design and Digital Solutions",
    seoDescription: "Build a professional business website with responsive design, service pages, contact forms, WhatsApp integration and basic SEO.",
    sections: [
      { heading: "The challenge", blocks: [
        p("Potential customers often want to understand what a business offers before making contact. They may search for the company, review its services, look for examples of its work and check whether it provides the solution they need."),
        p("If the business has no website or an unclear online presence, potential customers may struggle to find reliable information."),
        p("A website should provide a clear picture of the business and guide visitors towards a useful next step."),
      ] },
      { heading: "Our solution", blocks: [
        p("We design and develop responsive websites that present your business professionally and provide essential customer communication functionality."),
        p("Our focus is not just visual appearance. We want visitors to understand what you offer and know how to engage with your business."),
      ] },
      { heading: "What we deliver", blocks: [dl(
        { name: "Website Planning", text: "Define the website's purpose, audience, structure and required functionality." },
        { name: "Website Design", text: "Create page layouts and visual styles aligned with the business identity." },
        { name: "Website Development", text: "Build the website using an appropriate technology stack." },
        { name: "Responsive Design", text: "Ensure the website works across mobile phones, tablets and desktop devices." },
        { name: "Business Content Pages", text: "Create structured pages for company information, services, products, portfolio and contact details." },
        { name: "Contact Form Integration", text: "Allow visitors to submit enquiries through a configured contact form." },
        { name: "WhatsApp Integration", text: "Make it easier for visitors to start a conversation through WhatsApp." },
        { name: "Basic SEO Setup", text: "Configure relevant page titles, descriptions, headings and technical basics." },
        { name: "Deployment", text: "Connect the domain and deploy the website using the agreed hosting arrangement." },
        { name: "Maintenance", text: "Provide agreed basic maintenance and minor updates where included." },
      )] },
      { heading: "Example website structure", blocks: [
        p("A professional service business may need:"),
        ul("Homepage", "About page", "Services page", "Individual service pages", "Packages page", "Portfolio page", "FAQ page", "Contact page", "Privacy policy", "Terms and conditions"),
        p("The exact structure depends on the business model."),
      ] },
      { heading: "Our implementation process", blocks: [ol("Understand the business and target audience.", "Define the page structure.", "Prepare the content.", "Establish the visual direction.", "Design and develop the pages.", "Integrate contact and communication functionality.", "Test on different devices.", "Connect the domain.", "Deploy and hand over.")] },
      { heading: "Who needs this service?", blocks: [ul("New businesses", "Consulting firms", "Training companies", "Professional service providers", "Small and medium-sized businesses", "Businesses replacing outdated websites", "Businesses that need clearer service and product pages")] },
    ],
    faq: [
      { q: "Will my website work on mobile phones?", a: "Responsive design is included in the agreed website development scope." },
      { q: "Can you add WhatsApp to my website?", a: "Yes, where the business provides the appropriate WhatsApp contact details." },
      { q: "Can you create a contact form?", a: "Yes. The form will be configured using an agreed submission method and tested before handover." },
      { q: "Do you provide hosting?", a: "Hosting is arranged according to the agreed project or package scope." },
      { q: "Will you maintain the website?", a: "Maintenance is provided where included in the relevant package or service agreement." },
    ],
    finalTitle: "Let's Build a Website That Represents Your Business Properly.",
    finalCta: "Request a Website",
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
