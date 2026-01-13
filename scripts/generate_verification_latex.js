const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Supabase credentials
const supabaseUrl = 'https://uzieoxfqkglcoistswxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWVveGZxa2dsY29pc3Rzd3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDQwODIsImV4cCI6MjA3OTMyMDA4Mn0.iXOQmg_xIfRJaUI7HACjnCk9JAMcs0X9a770XUP5cb8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ASSETS_DIR = path.join(__dirname, '../docs/assets/player_images');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

function convertToJpg(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        // Convert to jpg, resize to reasonable thumbnail size to save space/memory in latex
        const cmd = `convert "${inputPath}" -resize 300x300\\> -quality 85 "${outputPath}"`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(`Conversion failed for ${inputPath}: ${error.message}`);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

async function downloadAndProcessImage(url, filename) {
    return new Promise(async (resolve, reject) => {
        if (!url) {
            resolve(null);
            return;
        }

        const finalFilename = filename.replace(/\.(png|jpeg|webp)$/, '') + '.jpg';
        const finalPath = path.join(ASSETS_DIR, finalFilename);
        const tempPath = path.join(ASSETS_DIR, `temp_${filename}`);

        // If final file exists and > 0 bytes, verify it works? 
        // For simplicity, if it exists, use it.
        if (fs.existsSync(finalPath) && fs.statSync(finalPath).size > 0) {
            resolve(finalFilename);
            return;
        }

        // Setup success handler to run conversion
        const handleSuccess = async () => {
             const success = await convertToJpg(tempPath, finalPath);
             fs.unlink(tempPath, () => {}); // clean temp
             if (success) {
                 resolve(finalFilename);
             } else {
                 resolve(null);
             }
        };

        if (url.startsWith('data:')) {
            try {
                const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const buffer = Buffer.from(matches[2], 'base64');
                    fs.writeFileSync(tempPath, buffer);
                    handleSuccess();
                    return;
                }
            } catch (e) {
                console.error('Data URI error', e);
            }
            resolve(null); 
            return;
        }

         if (!url.startsWith('http')) {
             resolve(null);
             return;
        }

        const file = fs.createWriteStream(tempPath);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                fs.unlink(tempPath, () => {});
                resolve(null);
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => handleSuccess());
            });
        }).on('error', (err) => {
            fs.unlink(tempPath, () => {});
            console.warn(`Download failed: ${url}`);
            resolve(null);
        });
    });
}

function escapeLatex(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\^/g, '\\textasciicircum{}')
        .replace(/~/g, '\\textasciitilde{}');
}

async function fetchHelpers() {
    const { data: registrations, error } = await supabase
        .from('team_registrations')
        .select('id, team_name, tournament_team_id');
        
    if (error) {
        console.error('Error fetching registrations:', error);
        return [];
    }
    return registrations;
}

async function getTeamPlayers(team, registrations) {
    let regId = null;
    const linkedReg = registrations.find(r => r.tournament_team_id === team.id);
    if (linkedReg) {
        regId = linkedReg.id;
    } else {
        const nameMatch = registrations.find(r => r.team_name && r.team_name.toLowerCase().trim() === team.name.toLowerCase().trim());
        if (nameMatch) {
            regId = nameMatch.id;
        }
    }

    if (!regId) return [];

    const { data: players, error } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', regId)
        .order('player_name');

    if (error) return [];
    return players;
}

async function processCategory(category, registrations) {
    const { data: teams, error } = await supabase
        .from('teams')
        .select('*')
        .eq('category', category)
        .order('name');

    if (error) return [];

    const processedTeams = [];
    for (const team of teams) {
        console.log(`Processing ${team.name}...`);
        const players = await getTeamPlayers(team, registrations);
        
        for (const player of players) {
            if (player.player_image) {
                const filename = `${team.id}_${player.id}`; 
                // We pass name without extension, but download logic handles temp file
                player.local_image = await downloadAndProcessImage(player.player_image, filename + '.orig');
            }
        }
        
        team.players = players;
        processedTeams.push(team);
    }
    return processedTeams;
}

function generateLatex(openAgeTeams, u17Teams) {
    let content = `\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[top=3cm, bottom=2cm, left=1cm, right=1cm]{geometry}
\\usepackage{graphicx}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{lastpage}
\\usepackage{tikz}
\\usepackage{anyfontsize}
\\usepackage{multicol}
\\usepackage{tcolorbox}
\\usepackage{amssymb} % Added for \\square

\\usepackage[hidelinks]{hyperref} % Clickable TOC

% Colors
\\definecolor{headerblue}{RGB}{26,35,126}
\\definecolor{cardbg}{RGB}{248,249,250}
\\definecolor{cardborder}{RGB}{222,226,230}

% Header and Footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textbf{MUQAWAMA 2026} | Team Verification}
\\fancyhead[R]{\\thepage}
\\fancyfoot[C]{\\footnotesize Official Verification Document}
\\renewcommand{\\headrulewidth}{0.4pt}
\\renewcommand{\\footrulewidth}{0.4pt}
\\setlength{\\headheight}{14pt}

% Player Card Command
\\newcommand{\\playercard}[3]{
    \\begin{tcolorbox}[colback=cardbg,colframe=cardborder,width=\\linewidth,arc=2mm,boxrule=0.5pt,left=1mm,right=1mm,top=1mm,bottom=1mm]
        \\begin{minipage}[c]{0.3\\linewidth}
            \\includegraphics[width=\\linewidth,height=2.5cm,keepaspectratio]{#3}
        \\end{minipage}
        \\hspace{0.2cm}
        \\begin{minipage}[c]{0.65\\linewidth}
            \\textbf{\\small Name:} #1 \\\\ \\vspace{0.3em}
            \\textbf{\\small Aadhar:} #2 \\\\ \\vspace{0.3em}
            \\textbf{\\small Verified:} $\\square$ ID \\hspace{0.1cm} $\\square$ Photo
        \\end{minipage}
    \\end{tcolorbox}
    \\vspace{0.2cm}
}

\\begin{document}

% Title Page
\\begin{titlepage}
    \\centering
    \\vspace*{1cm}
    \\includegraphics[width=0.4\\textwidth]{../assets/img/MuqawamaLogo.png} \\\\[1cm]
    {\\Huge\\bfseries MUQAWAMA 2026\\par}
    \\vspace{1cm}
    {\\Large Team Verification Register\\par}
    \\vfill
    {\\large Generated on: ${new Date().toLocaleDateString()}\\par}
\\end{titlepage}

\\newpage
\\tableofcontents
\\newpage
`;

    const generateCategorySection = (title, teams) => {
        let sectionContent = `\\section*{\\textcolor{headerblue}{${title}}}\n\\addcontentsline{toc}{section}{${title}}\n\\newpage\n`;
        
        teams.forEach((team) => {
            sectionContent += `
% Team Page: ${team.name}
\\phantomsection
\\addcontentsline{toc}{subsection}{${escapeLatex(team.name)}}
\\noindent
\\begin{minipage}{0.7\\textwidth}
    {\\Large\\bfseries ${escapeLatex(team.name)}} \\\\
    \\textbf{Captain:} ${escapeLatex(team.captain || 'TBD')} \\\\
    \\textbf{Group:} ${escapeLatex(team.group_name || 'TBD')}
\\end{minipage}
\\begin{minipage}{0.28\\textwidth}
    \\raggedleft
    Official Check: \\\\ \\vspace{0.2cm}
    $\\square$ Team Verified \\\\
    $\\square$ Refreshment Given
\\end{minipage}

\\vspace{0.5cm}
\\hrule
\\vspace{0.5cm}

\\begin{multicols}{2}
`;
            
            if (team.players.length === 0) {
                 sectionContent += `\\textit{No players registered for this team yet.}`;
            } else {
                team.players.forEach(player => {
                    const name = escapeLatex(player.player_name || 'Unknown');
                    let aadhar = 'N/A';
                    if (player.aadhar_no) {
                        const str = player.aadhar_no.toString();
                        aadhar = str.length >= 4 ? 'XXXX ' + str.slice(-4) : str;
                    }
                    
                    let imgPath = 'assets/player_images/placeholder.png'; 
                    if (player.local_image) {
                        imgPath = `assets/player_images/${player.local_image}`;
                    } else {
                         imgPath = 'example-image-a'; 
                    }
                    
                    sectionContent += `\\playercard{${name}}{${aadhar}}{${imgPath}}\n`;
                });
            }

            sectionContent += `\\end{multicols}
\\newpage
`;
        });
        
        return sectionContent;
    };

    content += generateCategorySection('OPEN AGE TEAMS', openAgeTeams);
    content += generateCategorySection('UNDER-17 TEAMS', u17Teams);

    content += `\\end{document}`;
    return content;
}

async function main() {
    console.log('Fetching registrations...');
    const registrations = await fetchHelpers();
    
    console.log('Processing Open Age...');
    const openAgeTeams = await processCategory('open-age', registrations);
    
    console.log('Processing U17...');
    const u17Teams = await processCategory('u17', registrations);

    console.log('Generating LaTeX...');
    const latexContent = generateLatex(openAgeTeams, u17Teams);

    const outputPath = path.join(__dirname, '../docs/team_verification.tex');
    fs.writeFileSync(outputPath, latexContent);
    console.log(`Saved to ${outputPath}`);
}

main();
