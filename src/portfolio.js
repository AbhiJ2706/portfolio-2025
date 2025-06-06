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

const BLUE = "#47c2f3"
const GREY = "#101414"
const BLACK = "#070a0a"
const GREEN = "linear-gradient(45deg, #10b981, #059669)"

// Dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: BLUE, // purple-400
      light: BLUE, // purple-300
      dark: BLUE, // purple-600
    },
    secondary: {
      main: BLUE, // blue-400
      light: BLUE, // blue-300
      dark: BLUE, // blue-500
    },
    background: {
      default: BLACK, // gray-900
      paper: GREY, // gray-800/95
    },
    text: {
      primary: '#e5e7eb', // gray-200
      secondary: '#9ca3af', // gray-400
    },
  },
  typography: {
    fontFamily: ['Figtree', '-apple-system', 'BlinkMacSystemFont'].join(","),
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
          backgroundColor: GREY, // gray-800/95
          border: `1px solid ${GREY}`, // gray-600/50
          borderRadius: '24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          backgroundColor: GREY, // gray-800/95
          border: `1px solid ${GREY}`, // gray-600/50
          borderRadius: '24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '16px',
            backgroundColor: GREY, // gray-700/90
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            color: GREY, // gray-200
            '& fieldset': {
              borderColor: GREY, // gray-500/40
            },
            '&:hover fieldset': {
              borderColor: BLUE, // purple-400/60
            },
            '&.Mui-focused fieldset': {
              borderColor: BLUE, // purple-400
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: GREY, // gray-400
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
        width: '70vw',
        maxWidth: '70vw',
        margin: '0 auto'
      }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header section - centered */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {experience.name ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" component="h3" color="primary" fontWeight="bold" gutterBottom>
                        {experience.name}
                    </Typography>
                    <Link href={experience.source} underline="hover">
                        <LaunchIcon fontSize='small' />
                    </Link>
                </Box>
              ) : (
                <></>
              )}

              <Typography variant="h6" component="h3" color="primary" fontWeight="bold" gutterBottom>
                {experience.organization}
              </Typography>
              
              <Typography variant="h6" component="h4" color="text.primary" fontWeight="medium" gutterBottom>
                {experience.position}
              </Typography>
              
              {experience.start ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {experience.start} - {experience.end}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {experience.location}
                    </Typography>
                </Box>
              ) : (
                <></>
              )}
              
            </Box>

            {/* Description section - left aligned */}
            <Box sx={{ textAlign: 'left', mb: 3, flexGrow: 1 }}>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography 
                    key={experience.organization} 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ lineHeight: 1.6, mb: 1 }}
                    >
                    {experience.long_description}
                </Typography>
              </Box>
            </Box>

            {/* Skills section - left aligned, at bottom */}
            <Box sx={{ textAlign: 'left', mt: 'auto' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {experience.core_skills.concat(experience.extra_skills).map((skill, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSkillClick(skill)}
                    sx={{
                      fontSize: '0.75rem',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(55, 65, 81, 0.8)', // gray-700/80
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(107, 114, 128, 0.4)', // gray-500/40
                      color: '#e5e7eb', // gray-200
                      transition: 'all 0.3s ease',
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
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="xl">

          {/* About Me Section */}
          <Fade in={true} timeout={1000}>
            <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
              <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, mb: 2 }}>
                {ResumeData.info.firstname + ' ' + ResumeData.info.lastname}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Software Engineer & AI/ML Developer
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontSize: '1.125rem', lineHeight: 1.7 }}>
                Welcome to my portfolio! I'm a passionate software enginner with expertise in AI/ML, 
                full-stack development, and embedded development. I love building innovative solutions and 
                contributing to cutting-edge research projects. Currently I am working at Amazon as an SDE 1 in the Ads division!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  href="https://github.com/abhij2706"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon fontSize='large'></GitHubIcon>
                </Button>
                
                <Button
                  href="https://linkedin.com/in/abhij2706"
                  target="_blank"
                >
                  <LinkedInIcon fontSize='large'/>
                </Button>
                
                <Button
                  href="mailto:a252jain@uwaterloo.ca"
                >
                  <EmailIcon fontSize='large'/>
                </Button>

                <Button>
                  <TwitterIcon fontSize='large'/>
                </Button>
              </Box>
            </Paper>
          </Fade>

          {/* Search Section */}
          <Fade in={true} timeout={1200}>
            <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, marginBottom: '3vh' }}>
                Use the search below to explore my experience and extracurriculars by skills, organizations, or any keywords that interest you. Or, scroll down to see all my experience!
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
                sx={{ mb: 3, fontSize: '1.125rem', input: { color: "#fff" }}}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allSkills.map((skill, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSkillClick(skill)}
                    sx={{
                      borderRadius: '20px',
                      backgroundColor: 'rgba(55, 65, 81, 0.8)', // gray-700/80
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(107, 114, 128, 0.4)', // gray-500/40
                      color: '#e5e7eb', // gray-200
                      transition: 'all 0.3s ease',
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
                    px: 4, 
                    pt: 2,
                    '& .MuiTab-root': {
                    color: '#9ca3af',
                    fontWeight: 'medium',
                    fontSize: '1.125rem',
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
              <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
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
                    py: 8, 
                    px: 4,
                  }}
                >
                  <Typography variant="h5" color="text.secondary">
                    No experiences match your search criteria
                  </Typography>
                </Paper>
              </Fade>
            )
          ) : activeTab === 1 ? (
            // Extracurriculars Tab
            filteredExtracurricularData.length > 0 ? (
              <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
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
                    py: 8, 
                    px: 4,
                  }}
                >
                  <Typography variant="h5" color="text.secondary">
                    No extracurriculars match your search criteria
                  </Typography>
                </Paper>
              </Fade>
            )
          ) : (
            // Extracurriculars Tab
            filteredProjectsData.length > 0 ? (
                <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
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
                        py: 8, 
                        px: 4,
                    }}
                    >
                    <Typography variant="h5" color="text.secondary">
                        No extracurriculars match your search criteria
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