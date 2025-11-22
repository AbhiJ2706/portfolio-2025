import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Link,
  Box,
  Grid,
  Paper,
  Button,
  Fade,
  Grow,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Search } from 'lucide-react';
// import Figtree from '/fonts/Figtree-Medium.ttf';
import ResumeData from './resume.json'

const BLUE = "#1e40af"
const LIGHT_GREY = "#f5f5f5"
const WHITE = "#ffffff"
const DARK_GREY = "#333333"
const GREEN = "linear-gradient(45deg, #10b981, #059669)"

// Light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BLUE,
      light: BLUE,
      dark: BLUE,
    },
    secondary: {
      main: BLUE,
      light: BLUE,
      dark: BLUE,
    },
    background: {
      default: WHITE,
      paper: LIGHT_GREY,
    },
    text: {
      primary: DARK_GREY,
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: ['Nunito Sans', '-apple-system', 'BlinkMacSystemFont'].join(","),
    h1: {
      fontWeight: 700,
      background: BLUE,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h2: {
      fontWeight: 600,
      color: BLUE,
    },
  },
  components: {
    // MuiCssBaseline: {
    //     styleOverrides: `
    //     @font-face {
    //     font-family: 'Figtree';
    //     font-style: normal;
    //     font-display: swap;
    //     font-weight: 400;
    //     src: url(${Figtree}) format('ttf');
    //     unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
    //     }
    // `,
    // },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          backgroundColor: WHITE,
          border: `1px solid #e0e0e0`,
          borderRadius: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          backgroundColor: WHITE,
          border: `1px solid #e0e0e0`,
          borderRadius: '24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        sub: {
            backgroundColor: "transparent",
            marginBottom: "100vh"
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: LIGHT_GREY,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            color: DARK_GREY,
            '& fieldset': {
              borderColor: '#d0d0d0',
            },
            '&:hover fieldset': {
              borderColor: BLUE,
            },
            '&.Mui-focused fieldset': {
              borderColor: BLUE,
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#999999',
            opacity: 1,
          },
        },
      },
    },
  },
});

const Portfolio = () => {
  // Sample data - replace with your actual data
  const experienceData = useMemo(() => ResumeData.sections[0].items, []);
  const extracurricularData = useMemo(() => ResumeData.sections[1].items, []);
  const projectsData = useMemo(() => ResumeData.sections[2].items, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredExperienceData, setFilteredExperienceData] = useState(experienceData);
  const [filteredExtracurricularData, setFilteredExtracurricularData] = useState(extracurricularData);
  const [filteredProjectsData, setFilteredProjectsData] = useState(projectsData);
  const [activeTab, setActiveTab] = useState(0);

  // Extract all unique skills
  const allSkills = useMemo(() => {
    const skills = new Set();
    experienceData.forEach(exp => {
      exp.core_skills.forEach(skill => skills.add(skill));
      exp.extra_skills.forEach(skill => skills.add(skill));
    });
    extracurricularData.forEach(exp => {
      exp.core_skills.forEach(skill => skills.add(skill));
      exp.extra_skills.forEach(skill => skills.add(skill));
    });
    projectsData.forEach(exp => {
        exp.core_skills.forEach(skill => skills.add(skill));
        exp.extra_skills.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).slice(0, 12); // Show first 12 skills
  }, [experienceData, extracurricularData, projectsData]);

  // Filter experiences based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExperienceData(experienceData);
      setFilteredExtracurricularData(extracurricularData);
      setFilteredProjectsData(projectsData);
      return;
    }

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filteredExperience = experienceData.filter(exp => {
      const searchableText = [
        exp.organization,
        exp.position,
        exp.domain,
        exp.location,
        ...exp.core_skills,
        ...exp.extra_skills,
        ...exp.description.map(d => d.summary)
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

    const filteredExtracurriculars = extracurricularData.filter(exp => {
        const searchableText = [
          exp.organization,
          exp.position,
          exp.domain,
          exp.location,
          ...exp.core_skills,
          ...exp.extra_skills,
          ...exp.description.map(d => d.summary)
        ].join(' ').toLowerCase();
  
        return searchTerms.every(term => searchableText.includes(term));
      });
    
    const filteredProjects = projectsData.filter(exp => {
        const searchableText = [
            exp.name,
            ...exp.core_skills,
            ...exp.extra_skills,
            ...exp.description.map(d => d.summary)
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
    });

    setFilteredExperienceData(filteredExperience);
    setFilteredExtracurricularData(filteredExtracurriculars);
    setFilteredProjectsData(filteredProjects);
  }, [searchQuery]);

  const handleSkillClick = (skill) => {
    setSearchQuery(skill);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ExperienceCard = ({ experience, index }) => (
    <Grow in={true} timeout={500 + index * 100}>
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        width: { xs: '95vw', sm: '90vw', md: '80vw', lg: '70vw' },
        maxWidth: { xs: '95vw', sm: '90vw', md: '80vw', lg: '70vw' },
        margin: '0 auto'
      }}>
          <CardContent sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            p: { xs: 2, sm: 3, md: 4 }
          }}>
            {/* Header section - centered */}
            <Box sx={{ textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
              {experience.name ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" component="h3" color="primary" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                        {experience.name}
                    </Typography>
                    <Link href={experience.source} underline="hover" sx={{ color: DARK_GREY, '&:hover': { color: BLUE } }}>
                        <LaunchIcon fontSize='small' />
                    </Link>
                </Box>
              ) : (
                <></>
              )}

              <Typography variant="h6" component="h3" color="primary" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {experience.organization}
              </Typography>
              
              <Typography variant="h6" component="h4" color="text.primary" fontWeight="medium" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                {experience.position}
              </Typography>
              
              {experience.start ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {experience.start} - {experience.end}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {experience.location}
                    </Typography>
                </Box>
              ) : (
                <></>
              )}
              
            </Box>

            {/* Description section - left aligned */}
            <Box sx={{ textAlign: 'left', mb: { xs: 2, sm: 3 }, flexGrow: 1 }}>
              <Box component="ul" sx={{ pl: { xs: 1, sm: 2 }, m: 0 }}>
                <Typography 
                    key={experience.organization} 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      lineHeight: 1.6, 
                      mb: 1,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                    >
                    {experience.long_description}
                </Typography>
              </Box>
            </Box>

            {/* Skills section - left aligned, at bottom */}
            <Box sx={{ textAlign: 'left', mt: 'auto' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 }, mb: 2 }}>
                {experience.core_skills.concat(experience.extra_skills).map((skill, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSkillClick(skill)}
                    sx={{
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      borderRadius: '20px',
                      backgroundColor: LIGHT_GREY,
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #d0d0d0',
                      color: DARK_GREY,
                      transition: 'all 0.3s ease',
                      padding: { xs: '2px 6px', sm: '4px 8px' },
                      '&:hover': {
                        background: GREEN,
                        color: 'white',
                        transform: 'scale(1.05)',
                        border: '1px solid transparent',
                      },
                    }}
                  >
                    {skill}
                  </Button>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Box>
    </Grow>
  );

  return (
    <ThemeProvider theme={lightTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          margin: 0,
          overflow: 'hidden',
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            mx: 'auto',
            width: '100%',
            maxWidth: '100%',
          }}
        >

          {/* About Me Section */}
          <Fade in={true} timeout={1000}>
            <Paper elevation={1} sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 2, sm: 3, md: 4 },
              mx: { xs: 0, sm: 1, md: 2 }
            }} class="MuiPaper-sub">
              <Typography variant="h1" component="h1" sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }, 
                mb: 2,
                wordBreak: 'break-word'
              }}>
                {ResumeData.info.firstname + ' ' + ResumeData.info.lastname}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ 
                mb: { xs: 2, sm: 3, md: 4 },
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
              }}>
                Software Engineer & AI/ML Developer
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ 
                mb: 2, 
                fontSize: { xs: '1rem', sm: '1.125rem' }, 
                lineHeight: 1.7,
                textAlign: { xs: 'left', sm: 'center' }
              }}>
                Welcome to my portfolio! I'm a passionate software engineer with expertise in AI/ML, 
                full-stack development, and embedded development. I love building innovative solutions and 
                contributing to cutting-edge research projects.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 }, 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                mt: { xs: 2, sm: 3 }
              }}>
                <Button
                  href="https://github.com/abhij2706"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ minWidth: 'auto', color: DARK_GREY, '&:hover': { color: BLUE } }}
                >
                  <GitHubIcon fontSize='large'></GitHubIcon>
                </Button>
                
                <Button
                  href="https://linkedin.com/in/abhij2706"
                  target="_blank"
                  sx={{ minWidth: 'auto', color: DARK_GREY, '&:hover': { color: BLUE } }}
                >
                  <LinkedInIcon fontSize='large'/>
                </Button>
                
                <Button
                  href="mailto:a252jain@uwaterloo.ca"
                  sx={{ minWidth: 'auto', color: DARK_GREY, '&:hover': { color: BLUE } }}
                >
                  <EmailIcon fontSize='large'/>
                </Button>

                <Button sx={{ minWidth: 'auto', color: DARK_GREY, '&:hover': { color: BLUE } }}>
                  <TwitterIcon fontSize='large'/>
                </Button>
              </Box>
            </Paper>
          </Fade>

          {/* Search Section */}
          <Fade in={true} timeout={1200}>
            <Paper elevation={1} sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 2, sm: 3, md: 4 }, 
              marginTop: { xs: "2vh", sm: "3vh", md: "5vh" },
              mx: { xs: 0, sm: 1, md: 2 }
            }}>
              <Typography variant="body1" color="text.secondary" sx={{ 
                lineHeight: 1.7, 
                marginBottom: { xs: '2vh', sm: '2.5vh', md: '3vh' },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' },
                textAlign: { xs: 'left', sm: 'center' }
              }}>
                Use the search below to explore my experience, extracurriculars and projects by skill or any keywords that interest you. Or, scroll down to see all my work!
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by skills, organization, domain, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} style={{ color: BLUE }} />
                    </InputAdornment>
                  ),
                }}
                  sx={{ 
                  mb: { xs: 2, sm: 3 }, 
                  fontSize: { xs: '1rem', sm: '1.125rem' }, 
                  input: { color: DARK_GREY }
                }}
              />
              
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 0.5, sm: 1 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                {allSkills.map((skill, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSkillClick(skill)}
                    sx={{
                      borderRadius: '20px',
                      backgroundColor: LIGHT_GREY,
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #d0d0d0',
                      color: DARK_GREY,
                      transition: 'all 0.3s ease',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '4px 8px', sm: '6px 12px' },
                      '&:hover': {
                        background: GREEN,
                        color: 'white',
                        transform: 'scale(1.05)',
                        border: '1px solid transparent',
                      },
                    }}
                  >
                    {skill}
                  </Button>
                ))}
              </Box>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{ 
                    px: { xs: 2, sm: 3, md: 4 }, 
                    pt: 2,
                    '& .MuiTab-root': {
                    color: '#666666',
                    fontWeight: 'medium',
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                    '&.Mui-selected': {
                        color: BLUE,
                    },
                    },
                    '& .MuiTabs-indicator': {
                    backgroundColor: BLUE,
                    },
                }}
                >
                    <Tab label="Experience" />
                    <Tab label="Extracurriculars" />
                    <Tab label="Projects" />
                </Tabs>
            </Paper>
          </Fade>
         

          {/* Experience/Extracurriculars Grid */}
          {activeTab === 0 ? (
            // Experience Tab
            filteredExperienceData.length > 0 ? (
              <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: 'center' }}>
                {filteredExperienceData.map((experience, index) => (
                  <Grid item xs={12} key={index}>
                    <ExperienceCard experience={experience} index={index} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Fade in={true} timeout={500}>
                <Paper 
                  elevation={20} 
                  sx={{ 
                    textAlign: 'center', 
                    py: { xs: 4, sm: 6, md: 8 }, 
                    px: { xs: 2, sm: 3, md: 4 },
                    mx: { xs: 0, sm: 1, md: 2 }
                  }}
                >
                  <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    No experiences match your search criteria
                  </Typography>
                </Paper>
              </Fade>
            )
          ) : activeTab === 1 ? (
            // Extracurriculars Tab
            filteredExtracurricularData.length > 0 ? (
              <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: 'center' }}>
                {filteredExtracurricularData.map((experience, index) => (
                  <Grid item xs={12} key={index}>
                    <ExperienceCard experience={experience} index={index} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Fade in={true} timeout={500}>
                <Paper 
                  elevation={20} 
                  sx={{ 
                    textAlign: 'center', 
                    py: { xs: 4, sm: 6, md: 8 }, 
                    px: { xs: 2, sm: 3, md: 4 },
                    mx: { xs: 0, sm: 1, md: 2 }
                  }}
                >
                  <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                    No extracurriculars match your search criteria
                  </Typography>
                </Paper>
              </Fade>
            )
          ) : (
            // Projects Tab
            filteredProjectsData.length > 0 ? (
                <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ justifyContent: 'center' }}>
                    {filteredProjectsData.map((experience, index) => (
                    <Grid item xs={12} key={index}>
                        <ExperienceCard experience={experience} index={index} />
                    </Grid>
                    ))}
                </Grid>
            ) : (
                <Fade in={true} timeout={500}>
                    <Paper 
                    elevation={20} 
                    sx={{ 
                        textAlign: 'center', 
                        py: { xs: 4, sm: 6, md: 8 }, 
                        px: { xs: 2, sm: 3, md: 4 },
                        mx: { xs: 0, sm: 1, md: 2 }
                    }}
                    >
                    <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                        No projects match your search criteria
                    </Typography>
                    </Paper>
                </Fade>
            )
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Portfolio;
