param(
    [string]$SampleDocx = "C:\Users\irfan\Downloads\FYP_Project_Management_Report_Updated_With_Flow_Diagrams.docx",
    [string]$OutputDocx = "E:\Departmental-complaints-project-main\Departmental-complaints-project-main\Departmental_Complaint_Project_Management_Report.docx"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Ensure-CleanDirectory {
    param([string]$Path)
    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Recurse -Force
    }
    New-Item -ItemType Directory -Path $Path | Out-Null
}

function Xml-Escape {
    param([string]$Text)
    if ($null -eq $Text) { return "" }
    $escaped = $Text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;")
    $escaped = $escaped.Replace('"', "&quot;").Replace("'", "&apos;")
    return $escaped
}

function New-ParagraphXml {
    param(
        [string]$Text,
        [string]$Style = "",
        [switch]$Center,
        [switch]$Bold,
        [switch]$Italic,
        [string]$Color = "",
        [int]$Size = 24
    )

    $styleXml = ""
    if ($Style) {
        $styleXml = "<w:pStyle w:val=""$Style""/>"
    }

    $jc = if ($Center) { "center" } else { "both" }
    $rPr = "<w:rFonts w:ascii=""Times New Roman"" w:hAnsi=""Times New Roman"" w:eastAsia=""Times New Roman""/>"
    if ($Bold) { $rPr += "<w:b/>" }
    if ($Italic) { $rPr += "<w:i/>" }
    if ($Color) { $rPr += "<w:color w:val=""$Color""/>" }
    $rPr += "<w:sz w:val=""$Size""/>"
    $escaped = Xml-Escape $Text

    return @"
<w:p>
  <w:pPr>
    $styleXml
    <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
    <w:jc w:val="$jc"/>
  </w:pPr>
  <w:r>
    <w:rPr>$rPr</w:rPr>
    <w:t xml:space="preserve">$escaped</w:t>
  </w:r>
</w:p>
"@
}

function New-BlankParagraphXml {
    return @"
<w:p>
  <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
</w:p>
"@
}

function New-PageBreakXml {
    return @"
<w:p>
  <w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>
  <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/></w:rPr><w:br w:type="page"/></w:r>
</w:p>
"@
}

function New-ImageXml {
    param(
        [string]$RelationshipId,
        [string]$PictureName,
        [int]$DocPrId,
        [int]$WidthEmu = 6035040,
        [int]$HeightEmu = 2866644,
        [string]$Caption
    )

    $captionXml = New-ParagraphXml -Text $Caption -Center -Italic -Color "4B5563" -Size 20
    $picName = Xml-Escape $PictureName

    $imageXml = @"
<w:p>
  <w:pPr>
    <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
    <w:jc w:val="center"/>
  </w:pPr>
  <w:r>
    <w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman"/></w:rPr>
    <w:drawing>
      <wp:inline xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <wp:extent cx="$WidthEmu" cy="$HeightEmu"/>
        <wp:docPr id="$DocPrId" name="Picture $DocPrId"/>
        <wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr>
                <pic:cNvPr id="0" name="$picName"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="$RelationshipId"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="$WidthEmu" cy="$HeightEmu"/></a:xfrm>
                <a:prstGeom prst="rect"/>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
$captionXml
"@

    return $imageXml
}

function New-TeamTableXml {
    $rows = @(
        @("Supervisor", "Guidance, review, and evaluation", "Checks scope, reviews progress, and gives final academic feedback."),
        @("Project Lead / Student", "Overall planning and coordination", "Handles analysis, coding, testing, report writing, and final presentation preparation."),
        @("Backend & Database", "Django APIs, JWT auth, SQLite schema", "Builds complaint models, department logic, users, permissions, and workflow rules."),
        @("Frontend / UI", "React dashboards and forms", "Creates student, HOD, DSA, supervisor, and faculty member screens for daily use."),
        @("ML & Automation", "Prediction, severity, chatbot, reports", "Adds category suggestion, priority scoring, similarity checking, and bot-based help."),
        @("QA & Documentation", "Testing, validation, and final files", "Checks main workflows and prepares the documentation, report, and deliverables.")
    )

    $builder = New-Object System.Text.StringBuilder
    [void]$builder.AppendLine('<w:tbl>')
    [void]$builder.AppendLine('<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:type="auto" w:w="0"/><w:jc w:val="center"/><w:tblLook w:firstColumn="1" w:firstRow="1" w:lastColumn="0" w:lastRow="0" w:noHBand="0" w:noVBand="1" w:val="04A0"/></w:tblPr>')
    [void]$builder.AppendLine('<w:tblGrid><w:gridCol w:w="3010"/><w:gridCol w:w="3010"/><w:gridCol w:w="3010"/></w:tblGrid>')

    $headers = @("Role", "Main Responsibility", "FYP Explanation")
    [void]$builder.AppendLine('<w:tr>')
    foreach ($header in $headers) {
        $text = Xml-Escape $header
        [void]$builder.AppendLine("<w:tc><w:tcPr><w:tcW w:type=""dxa"" w:w=""3010""/><w:vAlign w:val=""center""/><w:shd w:fill=""EDE9FE""/></w:tcPr><w:p><w:r/><w:r><w:rPr><w:b/><w:sz w:val=""21""/></w:rPr><w:t>$text</w:t></w:r></w:p></w:tc>")
    }
    [void]$builder.AppendLine('</w:tr>')

    foreach ($row in $rows) {
        [void]$builder.AppendLine('<w:tr>')
        foreach ($cell in $row) {
            $text = Xml-Escape $cell
            [void]$builder.AppendLine("<w:tc><w:tcPr><w:tcW w:type=""dxa"" w:w=""3010""/><w:vAlign w:val=""center""/></w:tcPr><w:p><w:r/><w:r><w:rPr><w:b w:val=""0""/><w:sz w:val=""21""/></w:rPr><w:t>$text</w:t></w:r></w:p></w:tc>")
        }
        [void]$builder.AppendLine('</w:tr>')
    }

    [void]$builder.AppendLine('</w:tbl>')
    return $builder.ToString()
}

function Get-Rect {
    param([int]$X, [int]$Y, [int]$Width, [int]$Height)
    return New-Object System.Drawing.RectangleF($X, $Y, $Width, $Height)
}

function Draw-RoundedBox {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [string]$FillHex,
        [string]$BorderHex,
        [string]$Text,
        [System.Drawing.Font]$Font
    )

    $fill = [System.Drawing.ColorTranslator]::FromHtml($FillHex)
    $border = [System.Drawing.ColorTranslator]::FromHtml($BorderHex)
    $fillBrush = New-Object System.Drawing.SolidBrush($fill)
    $pen = New-Object System.Drawing.Pen($border, 2)
    $rect = Get-Rect -X $X -Y $Y -Width $Width -Height $Height
    $Graphics.FillRectangle($fillBrush, $rect)
    $Graphics.DrawRectangle($pen, $X, $Y, $Width, $Height)

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textBrush = [System.Drawing.Brushes]::Black
    $Graphics.DrawString($Text, $Font, $textBrush, $rect, $format)

    $fillBrush.Dispose()
    $pen.Dispose()
    $format.Dispose()
}

function Draw-Arrow {
    param(
        [System.Drawing.Graphics]$Graphics,
        [int]$X1,
        [int]$Y1,
        [int]$X2,
        [int]$Y2,
        [string]$Hex = "#475569"
    )

    $pen = New-Object System.Drawing.Pen(([System.Drawing.ColorTranslator]::FromHtml($Hex)), 4)
    $cap = New-Object System.Drawing.Drawing2D.AdjustableArrowCap(5, 7)
    $pen.CustomEndCap = $cap
    $Graphics.DrawLine($pen, $X1, $Y1, $X2, $Y2)
    $cap.Dispose()
    $pen.Dispose()
}

function New-DiagramBitmap {
    param(
        [string]$Path,
        [string]$Title,
        [scriptblock]$Body
    )

    $bmp = New-Object System.Drawing.Bitmap 1200, 560
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::White)

    $titleFont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Arial", 17, [System.Drawing.FontStyle]::Bold)
    $smallFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Regular)
    $graphics.DrawString($Title, $titleFont, [System.Drawing.Brushes]::DarkSlateBlue, 30, 18)
    $graphics.DrawString("Departmental Complaint Management System", $smallFont, [System.Drawing.Brushes]::SlateGray, 34, 56)

    & $Body $graphics $bodyFont $smallFont

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $smallFont.Dispose()
    $bodyFont.Dispose()
    $titleFont.Dispose()
    $graphics.Dispose()
    $bmp.Dispose()
}

function Build-PhaseDiagram {
    param([string]$Path)
    New-DiagramBitmap -Path $Path -Title "Project Management Phase Flow" -Body {
        param($g, $font, $small)
        $boxes = @(
            @{ X = 60; Y = 210; W = 220; H = 110; Fill = "#E0EAFF"; Border = "#3D72E0"; Text = "Initiation`nProblem + Scope" },
            @{ X = 340; Y = 210; W = 220; H = 110; Fill = "#EDE9FE"; Border = "#7C3AED"; Text = "Planning`nRoles + Risks" },
            @{ X = 620; Y = 210; W = 220; H = 110; Fill = "#DCFCE7"; Border = "#16A34A"; Text = "Execution`nBuild + Test" },
            @{ X = 900; Y = 210; W = 220; H = 110; Fill = "#FEF3C7"; Border = "#D97706"; Text = "Delivery`nHandover + Viva" }
        )
        foreach ($box in $boxes) {
            Draw-RoundedBox -Graphics $g -X $box.X -Y $box.Y -Width $box.W -Height $box.H -FillHex $box.Fill -BorderHex $box.Border -Text $box.Text -Font $font
        }
        Draw-Arrow -Graphics $g -X1 280 -Y1 265 -X2 340 -Y2 265
        Draw-Arrow -Graphics $g -X1 560 -Y1 265 -X2 620 -Y2 265
        Draw-Arrow -Graphics $g -X1 840 -Y1 265 -X2 900 -Y2 265
        $g.DrawString("The project moved from idea identification to planning, practical development, and final handover.", $small, [System.Drawing.Brushes]::DimGray, 120, 390)
    }
}

function Build-TeamDiagram {
    param([string]$Path)
    New-DiagramBitmap -Path $Path -Title "Recommended FYP Team Structure" -Body {
        param($g, $font, $small)
        Draw-RoundedBox -Graphics $g -X 430 -Y 110 -Width 320 -Height 80 -FillHex "#EDE9FE" -BorderHex "#7C3AED" -Text "Supervisor" -Font $font
        Draw-RoundedBox -Graphics $g -X 390 -Y 230 -Width 400 -Height 90 -FillHex "#E0EAFF" -BorderHex "#3D72E0" -Text "Project Lead / Student Developer" -Font $font
        Draw-Arrow -Graphics $g -X1 590 -Y1 190 -X2 590 -Y2 230

        $items = @(
            @{ X = 60; Y = 390; Fill = "#E0F2FE"; Border = "#0284C7"; Text = "Backend`nDatabase + API" },
            @{ X = 340; Y = 390; Fill = "#DCFCE7"; Border = "#16A34A"; Text = "Frontend`nDashboards + Forms" },
            @{ X = 620; Y = 390; Fill = "#FEF3C7"; Border = "#D97706"; Text = "ML / Automation`nSuggestion + Bot" },
            @{ X = 900; Y = 390; Fill = "#FCE7F3"; Border = "#DB2777"; Text = "QA + Documentation`nTesting + Report" }
        )
        foreach ($item in $items) {
            Draw-RoundedBox -Graphics $g -X $item.X -Y $item.Y -Width 240 -Height 95 -FillHex $item.Fill -BorderHex $item.Border -Text $item.Text -Font $font
        }
        foreach ($x in @(180, 460, 740, 1020)) {
            Draw-Arrow -Graphics $g -X1 590 -Y1 320 -X2 $x -Y2 390
        }
        $g.DrawString("In practice, one student can handle these roles, but separating them shows professional planning.", $small, [System.Drawing.Brushes]::DimGray, 150, 515)
    }
}

function Build-ExecutionDiagram {
    param([string]$Path)
    New-DiagramBitmap -Path $Path -Title "System Execution Workflow" -Body {
        param($g, $font, $small)
        $boxes = @(
            @{ X = 30; Y = 230; W = 160; H = 90; Fill = "#E0EAFF"; Border = "#3D72E0"; Text = "Student`nSubmits Complaint" },
            @{ X = 230; Y = 230; W = 170; H = 90; Fill = "#DBEAFE"; Border = "#2563EB"; Text = "React Frontend`nForm + Dashboard" },
            @{ X = 440; Y = 230; W = 170; H = 90; Fill = "#DCFCE7"; Border = "#16A34A"; Text = "Django API`nValidation + Save" },
            @{ X = 650; Y = 120; W = 200; H = 90; Fill = "#FEF3C7"; Border = "#D97706"; Text = "ML Support`nCategory + Priority" },
            @{ X = 650; Y = 340; W = 200; H = 90; Fill = "#FCE7F3"; Border = "#DB2777"; Text = "Workflow Routing`nHOD / DSA" },
            @{ X = 900; Y = 230; W = 160; H = 90; Fill = "#EDE9FE"; Border = "#7C3AED"; Text = "Teacher`nResolve + Comment" },
            @{ X = 1080; Y = 230; W = 90; H = 90; Fill = "#F1F5F9"; Border = "#475569"; Text = "Logs`nNotify`nRate" }
        )
        foreach ($box in $boxes) {
            Draw-RoundedBox -Graphics $g -X $box.X -Y $box.Y -Width $box.W -Height $box.H -FillHex $box.Fill -BorderHex $box.Border -Text $box.Text -Font $font
        }
        Draw-Arrow -Graphics $g -X1 190 -Y1 275 -X2 230 -Y2 275
        Draw-Arrow -Graphics $g -X1 400 -Y1 275 -X2 440 -Y2 275
        Draw-Arrow -Graphics $g -X1 610 -Y1 255 -X2 650 -Y2 180
        Draw-Arrow -Graphics $g -X1 610 -Y1 295 -X2 650 -Y2 385
        Draw-Arrow -Graphics $g -X1 850 -Y1 385 -X2 900 -Y2 275
        Draw-Arrow -Graphics $g -X1 1060 -Y1 275 -X2 1080 -Y2 275
        $g.DrawString("This shows how the student portal, backend logic, routing, faculty workflow, and feedback cycle work together.", $small, [System.Drawing.Brushes]::DimGray, 90, 500)
    }
}

function Build-DeliveryDiagram {
    param([string]$Path)
    New-DiagramBitmap -Path $Path -Title "Delivery and Handover Flow" -Body {
        param($g, $font, $small)
        $boxes = @(
            @{ X = 60; Y = 215; W = 180; H = 95; Fill = "#DCFCE7"; Border = "#16A34A"; Text = "Testing`nMain User Flows" },
            @{ X = 300; Y = 215; W = 180; H = 95; Fill = "#E0EAFF"; Border = "#3D72E0"; Text = "Deployment Setup`nBackend + Frontend" },
            @{ X = 540; Y = 215; W = 180; H = 95; Fill = "#EDE9FE"; Border = "#7C3AED"; Text = "User Training`nStudent + Staff" },
            @{ X = 780; Y = 215; W = 180; H = 95; Fill = "#FEF3C7"; Border = "#D97706"; Text = "Transfer Documents`nCode + Report" },
            @{ X = 1000; Y = 215; W = 150; H = 95; Fill = "#FCE7F3"; Border = "#DB2777"; Text = "Viva / Demo`nFinal Review" }
        )
        foreach ($box in $boxes) {
            Draw-RoundedBox -Graphics $g -X $box.X -Y $box.Y -Width $box.W -Height $box.H -FillHex $box.Fill -BorderHex $box.Border -Text $box.Text -Font $font
        }
        Draw-Arrow -Graphics $g -X1 240 -Y1 262 -X2 300 -Y2 262
        Draw-Arrow -Graphics $g -X1 480 -Y1 262 -X2 540 -Y2 262
        Draw-Arrow -Graphics $g -X1 720 -Y1 262 -X2 780 -Y2 262
        Draw-Arrow -Graphics $g -X1 960 -Y1 262 -X2 1000 -Y2 262
        $g.DrawString("The final stage focuses on testing, deployment preparation, training, documentation, and presentation.", $small, [System.Drawing.Brushes]::DimGray, 130, 400)
    }
}

function Build-DocumentXml {
    $parts = New-Object System.Collections.Generic.List[string]

    $parts.Add((New-ParagraphXml -Text "FYP PROJECT MANAGEMENT REPORT" -Center -Bold -Size 36))
    $parts.Add((New-ParagraphXml -Text "Updated with Flow Diagrams and Improved Team Structure" -Center -Bold -Color "7C3AED" -Size 28))
    $parts.Add((New-ParagraphXml -Text "Project: Departmental Complaint Management System" -Center -Size 26))
    $parts.Add((New-ParagraphXml -Text "AI-Assisted Web Platform for Student Complaint Handling" -Center -Size 26))
    $parts.Add((New-ParagraphXml -Text "Simple Student-Style Version" -Center -Size 26))
    $parts.Add((New-BlankParagraphXml))
    $parts.Add((New-ParagraphXml -Text "This report explains the departmental complaint management project according to the four project management phases: Initiation, Planning, Execution, and Delivery. The system is built for a university environment where students can submit complaints, departments can review them, teachers can resolve them, and administrators can track progress. Flow diagrams are included to make the team structure, development flow, complaint workflow, and handover process easier to understand." -Size 24))
    $parts.Add((New-ImageXml -RelationshipId "rId9" -PictureName "phase_flow.png" -DocPrId 1 -WidthEmu 6035040 -HeightEmu 2866644 -Caption "Fig. 1: Project Management Phase Flow"))
    $parts.Add((New-PageBreakXml))

    $parts.Add((New-ParagraphXml -Text "1. Initiation Phase" -Style "Heading1" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Goals" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The main goal of my project is to provide a digital system for handling departmental complaints in a more organized and transparent way. The system helps students submit issues, helps HOD and DSA review them, helps faculty members work on assigned cases, and helps the supervisor monitor the whole process." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Specifications" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The project uses React with Vite on the frontend and Django REST Framework on the backend. JWT authentication is used for login, SQLite is used for development data storage, and machine learning support is used for complaint category suggestion, similarity checking, and severity scoring. The system also contains activity logs, PDF reporting, and a chatbot-style help assistant." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Tasks" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "At the start of the project, I identified the problem of manual or unclear complaint handling in departments. I studied what different users need, selected the technologies, defined the user roles, planned the complaint lifecycle, and decided how AI-based support could improve categorization and prioritization." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Responsibilities" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The project responsibilities included problem analysis, requirement gathering, role-based design, backend development, frontend dashboards, testing, and report writing. Even though this is a student project, the work can still be divided into professional roles to show proper project management understanding." -Size 24))

    $parts.Add((New-ParagraphXml -Text "2. Planning Phase" -Style "Heading1" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Schedules" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "I planned the project according to a semester-based timeline. The early part was used for analysis and design, the middle part was used for backend and frontend implementation, and the final stage focused on testing, documentation, and presentation preparation." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Budgets" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "This FYP did not require a large financial budget because the main tools were open source. The major cost was time, effort, internet access, and the use of a laptop for development, testing, and report preparation." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Resources" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The main resources were the Django backend, React frontend, development libraries, machine learning files, report generation tools, and a local database. Human resources mainly included the student developer and the project supervisor, while the role-based design also considered students, HOD, DSA, teachers, and supervisor users." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Risks" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Some risks in planning were role confusion, weak security checks, incorrect complaint routing, low-quality complaint descriptions, and integration problems between dashboards and APIs. I reduced these risks by using separate permissions, complaint status rules, structured forms, and modular backend logic." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Team Structure for FYP" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The most important point in this phase is team structure. A professional structure for this FYP can include Supervisor, Project Lead, Backend and Database role, Frontend role, ML and Automation role, and QA and Documentation role. In my case, one student handled most of these responsibilities, but writing them separately makes the project look more organized and professionally managed." -Size 24))
    $parts.Add((New-ImageXml -RelationshipId "rId10" -PictureName "team_structure_flow.png" -DocPrId 2 -WidthEmu 6035040 -HeightEmu 3470148 -Caption "Fig. 2: Recommended FYP Team Structure Flow Diagram"))
    $parts.Add((New-ParagraphXml -Text "The team structure can be explained as follows:" -Size 24))
    $parts.Add((New-TeamTableXml))
    $parts.Add((New-ParagraphXml -Text "Planned Deliverables" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The planned deliverables were the working complaint management application, role-based dashboards, complaint routing logic, ML-supported suggestion modules, analytics, PDF reports, and final project documentation." -Size 24))

    $parts.Add((New-ParagraphXml -Text "3. Execution Phase" -Style "Heading1" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Status Report Based on 6 Chapters" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Chapter 1 - Introduction: This chapter explains the background of the project and why a digital departmental complaint system is needed. It introduces the issue of delayed complaint handling and shows how a structured web platform can improve communication and accountability." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Chapter 2 - System Analysis: This chapter explains the requirements of students, HOD, DSA, faculty members, and supervisor users. It identifies the need for complaint submission, review, assignment, status updates, comments, notifications, and transparent tracking." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Chapter 3 - System Design: This chapter explains the architecture before implementation. It includes database entities such as users, departments, complaints, attachments, notifications, comments, activity logs, and category routes. It also covers role-based dashboards and API connections." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Chapter 4 - System Development and Implementation: This chapter describes the actual coding work. It includes React dashboard development, Django REST APIs, JWT authentication, complaint submission forms, teacher assignment, escalation logic, analytics, and weekly PDF reporting." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Chapter 5 - User Guide: This chapter tells how users operate the system. Students submit and track complaints, HOD reviews cases, DSA or supervisor assigns faculty, teachers update status and comments, and students give ratings after resolution." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Chapter 6 - Conclusion: This chapter gives the final summary. It shows that the project successfully covers the complaint workflow, improves visibility of case progress, and provides a strong base for future deployment and expansion." -Size 24))
    $parts.Add((New-ParagraphXml -Text "System Execution Workflow" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "A flow diagram is useful here because the execution phase includes connected parts: complaint form, frontend validation, backend storage, ML suggestion, department routing, faculty resolution, notification updates, and student feedback. The following diagram shows how these parts work together during practical implementation." -Size 24))
    $parts.Add((New-ImageXml -RelationshipId "rId11" -PictureName "system_execution_workflow.png" -DocPrId 3 -WidthEmu 6035040 -HeightEmu 2942082 -Caption "Fig. 3: System Execution Workflow"))
    $parts.Add((New-ParagraphXml -Text "Changes" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "During execution, some improvements were made to increase stability and realism. For example, role permissions were made stricter, complaint routing was aligned with departments, assignment and finalization actions were separated, and logs were added to make the workflow easier to audit." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Quality" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Quality was managed by keeping the project modular, checking key user flows, validating attachments, applying permission checks, and reviewing major screens like student, HOD, DSA, teacher, and supervisor dashboards. This made the system easier to understand and reduced the chance of major demo issues." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Forecasts" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "In this phase, I had to decide which features should be completed in the final version and which could remain for future work. The main focus stayed on complaint submission, routing, assignment, resolution, ratings, analytics, and reporting, while larger production features can be added later." -Size 24))

    $parts.Add((New-ParagraphXml -Text "4. Delivery Phase" -Style "Heading1" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Train Customer" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "At delivery stage, the system should be explained to its users. Students should know how to submit and track complaints, HOD and DSA should know how to review and assign them, teachers should know how to update status and comments, and supervisors should know how to monitor departments and activity." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Transfer Documents" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "The final project should include source code, setup instructions, database structure, API details, machine learning files, and the written report. This makes it easier for the supervisor or examiner to understand how the project works and how it can be executed." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Release Resources" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "After final submission, test data and temporary development resources can be archived or cleaned. The final version of the project should stay organized so that it is ready for checking, presentation, and future enhancement." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Reassign Staff" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "In a company, this means moving team members to other work. In an FYP, it means that after development is completed, the main effort shifts toward final corrections, viva preparation, and demonstration of the working system." -Size 24))
    $parts.Add((New-ImageXml -RelationshipId "rId12" -PictureName "delivery_flow.png" -DocPrId 4 -WidthEmu 5943600 -HeightEmu 2456688 -Caption "Fig. 4: Delivery and Handover Flow"))
    $parts.Add((New-ParagraphXml -Text "Lessons Learned" -Style "Heading2" -Size 24))
    $parts.Add((New-ParagraphXml -Text "This project taught that clear workflow design is very important in complaint handling systems. It also showed that role-based permissions, documentation, and testing should be considered from the beginning, while AI-based support is useful only when it is backed by proper software engineering and validation." -Size 24))
    $parts.Add((New-ParagraphXml -Text "Conclusion" -Style "Heading1" -Size 24))
    $parts.Add((New-ParagraphXml -Text "Overall, this FYP can be clearly explained through the four project management phases. The initiation phase defined the problem and project goals, the planning phase organized resources and structure, the execution phase produced the actual complaint management system, and the delivery phase focused on training, handover, and final presentation. The added flow diagrams make the report easier to understand and show that the project is both technical and properly managed." -Size 24))

    $body = ($parts -join "`n")
    return @"
<?xml version='1.0' encoding='UTF-8' standalone='yes'?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mo="http://schemas.microsoft.com/office/mac/office/2008/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:mv="urn:schemas-microsoft-com:mac:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
$body
    <w:sectPr w:rsidR="00FC693F" w:rsidRPr="0006063C" w:rsidSect="00034616">
      <w:pgSz w:w="11909" w:h="16834"/>
      <w:pgMar w:top="1152" w:right="1440" w:bottom="1152" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"@
}

if (-not (Test-Path -LiteralPath $SampleDocx)) {
    throw "Sample file not found: $SampleDocx"
}

$workspace = Split-Path -Parent $OutputDocx
$tempRoot = Join-Path $workspace "report_build"
$zipPath = Join-Path $workspace "report_template.zip"
$outZip = Join-Path $workspace "Departmental_Complaint_Project_Management_Report.zip"

Ensure-CleanDirectory -Path $tempRoot
Copy-Item -LiteralPath $SampleDocx -Destination $zipPath -Force
Expand-Archive -LiteralPath $zipPath -DestinationPath $tempRoot -Force

$mediaDir = Join-Path $tempRoot "word\media"
if (-not (Test-Path -LiteralPath $mediaDir)) {
    New-Item -ItemType Directory -Path $mediaDir | Out-Null
}

Build-PhaseDiagram -Path (Join-Path $mediaDir "image1.png")
Build-TeamDiagram -Path (Join-Path $mediaDir "image2.png")
Build-ExecutionDiagram -Path (Join-Path $mediaDir "image3.png")
Build-DeliveryDiagram -Path (Join-Path $mediaDir "image4.png")

$documentXml = Build-DocumentXml
Set-Content -LiteralPath (Join-Path $tempRoot "word\document.xml") -Value $documentXml -Encoding UTF8

if (Test-Path -LiteralPath $outZip) {
    Remove-Item -LiteralPath $outZip -Force
}
if (Test-Path -LiteralPath $OutputDocx) {
    Remove-Item -LiteralPath $OutputDocx -Force
}

Compress-Archive -Path (Join-Path $tempRoot "*") -DestinationPath $outZip -Force
Copy-Item -LiteralPath $outZip -Destination $OutputDocx -Force

Write-Output "Generated: $OutputDocx"
