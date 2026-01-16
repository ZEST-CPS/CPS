const { createApp, ref, onMounted } = Vue;
const { createRouter, createWebHashHistory, useRoute, useRouter } = VueRouter;

// 静态数据 - 从JSON文件读取
let papersData = null;
let overviewData = null;

// 获取基础路径（兼容 GitHub Pages 子路径部署）
function getBasePath() {
  const path = window.location.pathname;
  // 如果路径包含仓库名（如 /CPS/），提取基础路径
  const match = path.match(/^(\/[^\/]+\/)/);
  if (match) {
    return match[1]; // 返回 /CPS/
  }
  // 本地开发时返回 /
  return '/';
}

// 加载JSON数据
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('加载JSON数据失败:', url, error);
    return null;
  }
}

// 初始化数据
async function initData() {
  if (!papersData) {
    const basePath = getBasePath();
    papersData = await loadJSON(`${basePath}data/papers.json`);
  }
  if (!overviewData) {
    const basePath = getBasePath();
    overviewData = await loadJSON(`${basePath}data/overview.json`);
  }
}

// API 接口（从JSON读取）
const api = {
  async getAllPapers() {
    await initData();
    const allPapers = [
      ...(papersData?.measurement || []),
      ...(papersData?.analysis || []),
      ...(papersData?.intervention || [])
    ];
    return { data: allPapers };
  },
  async getPapersByCategory(category) {
    await initData();
    const papers = papersData?.[category] || [];
    return { data: papers };
  },
  async getPaperById(id) {
    await initData();
    const allPapers = [
      ...(papersData?.measurement || []),
      ...(papersData?.analysis || []),
      ...(papersData?.intervention || [])
    ];
    const paper = allPapers.find(p => p.id === parseInt(id));
    return { data: paper };
  },
  async getCategories() {
    return { data: [
      { value: 'measurement', label: '测量' },
      { value: 'analysis', label: '分析' },
      { value: 'intervention', label: '干预' }
    ]};
  },
  async getOverviewAll() {
    await initData();
    return { data: overviewData?.sections || [] };
  },
  async getOverviewBySection(section) {
    await initData();
    const sections = overviewData?.sections || [];
    const result = sections.filter(s => s.section === section);
    return { data: result };
  }
};

// NavBar 组件
const NavBar = {
  setup() {
    const router = useRouter();
    const activeIndex = ref('home');

    const menuItems = [
      { index: 'home', path: '/', label: '首页' },
      { index: 'measurement', path: '/measurement', label: '测量' },
      { index: 'analysis', path: '/analysis', label: '分析' },
      { index: 'intervention', path: '/intervention', label: '干预' }
    ];

    const handleSelect = (key) => {
      const item = menuItems.find(m => m.index === key);
      if (item) {
        router.push(item.path);
      }
    };

    return {
      activeIndex,
      menuItems,
      handleSelect
    };
  },
  template: `
    <div class="navbar">
      <el-menu
        :default-active="activeIndex"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
    </div>
  `
};

// Footer 组件
const Footer = {
  template: `
    <div>
      <p>© 2024 项目成果展示网站</p>
    </div>
  `
};

// Home 组件
const Home = {
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const projectSections = ref([]);

    const formatContent = (content) => {
      if (!content) return '';
      return content.replace(/\n/g, '<br>');
    };

    const formatSectionContent = (content) => {
      if (!content) return '';
      const lines = content.split('\n').filter(line => line.trim());
      return lines.map(line => {
        return `<div style="display: block; margin: 8px 0; color: #555; font-size: 15px; line-height: 1.8;">${line.trim()}</div>`;
      }).join('');
    };

    const getImageUrl = (url) => {
      if (!url) return '';
      // 如果已经是完整URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // 获取基础路径
      const basePath = getBasePath();
      // 如果是绝对路径（以/开头），添加基础路径
      if (url.startsWith('/')) {
        return basePath + url.substring(1);
      }
      // 如果是相对路径（以./开头），去掉./前缀并添加基础路径
      if (url.startsWith('./')) {
        return basePath + url.substring(2);
      }
      // 默认添加基础路径
      return basePath + url;
    };

    const goToSection = (section) => {
      const routeMap = {
        'measurement_intro': '/measurement',
        'analysis_intro': '/analysis',
        'intervention_intro': '/intervention'
      };
      const route = routeMap[section];
      if (route) {
        router.push(route);
      }
    };

    const loadData = async () => {
      try {
        loading.value = true;
        const response = await api.getOverviewAll();
        const sections = response.data || [];
        
        projectSections.value = [
          sections.find(s => s.section === 'measurement_intro'),
          sections.find(s => s.section === 'analysis_intro'),
          sections.find(s => s.section === 'intervention_intro')
        ].filter(Boolean);
      } catch (error) {
        console.error('加载数据失败:', error);
        ElementPlus.ElMessage.error('加载数据失败，请检查JSON文件');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadData();
    });

    return {
      loading,
      projectSections,
      formatContent,
      formatSectionContent,
      goToSection,
      getImageUrl
    };
  },
  template: `
    <div class="home">
      <h1 class="page-title">项目总览</h1>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else>
        <!-- 项目背景 -->
        <section class="content-box project-background">
          <h2 class="section-title">项目背景</h2>
          <div class="content-text">
            随着21世纪信息化和全球化的不断深入，知识和技术正在经历重要的转型。随着职业分工日益细化和项目的复杂化，很多问题的解决都需要具有不同专业背景的成员共同努力才能完成。合作能力(collaboration)、创新能力(creativity)、交流能力(communication)和批判性思维(Critical thinking)被公认为21世纪的人才所应具备的核心技能(4C)。中共中央、国务院在2019年初印发的《中国教育现代化2035》中强调了对于学生"实践动手能力、合作能力、创新能力的培养"。教育部发布的《义务教育小学科学课程标准》以及《普通高中课程方案(2017年版)》，也将"合作与交流"和"探索解决问题"列为学生应具备关键能力。合作解决问题(CollaborativeProblemSolving，CPS)能力作为一项复合型能力，涵盖了实践、批判性思维、合作、交流、创新等多方面的能力，是核心素养中重要组成部分之一。
          </div>
        </section>
        <!-- 研究框架图 -->
        <section class="content-box research-framework">
          <h2 class="section-title">研究框架</h2>
          <div class="image-container framework-image">
            <el-image 
              :src="getImageUrl('/images/research_framework.png')" 
              fit="contain"
              :preview-src-list="[getImageUrl('/images/research_framework.png')]"
              alt="研究框架图"
            />
          </div>
        </section>
        <div class="project-sections">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="8" v-for="section in projectSections" :key="section.id">
              <el-card class="section-card" shadow="hover" @click="goToSection(section.section)">
                <div class="card-content">
                  <h3>{{ section.title }}</h3>
                  <div class="card-text" v-html="formatSectionContent(section.short_content || section.content)"></div>
                  <el-button type="primary" plain>查看详情</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
          <div v-if="projectSections.length === 0" class="empty-state">
            <el-alert
              title="提示"
              type="info"
              :closable="false"
              show-icon>
              <template #default>
                <p>暂无项目介绍数据，请编辑 <code>frontend/data/overview.json</code> 文件添加项目总览内容。</p>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </div>
  `
};

// 创建论文列表页面
function createPaperListPage(category, title, sectionKey) {
  return {
    setup() {
      const loading = ref(true);
      const papers = ref([]);
      const introSection = ref(null);

      const formatContent = (content) => {
        if (!content) return '';
        return content.replace(/\n/g, '<br>');
      };

      const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
      };

      const getImageUrl = (url) => {
        if (!url) return '';
        // 如果已经是完整URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        // 获取基础路径
        const basePath = getBasePath();
        // 如果是绝对路径（以/开头），添加基础路径
        if (url.startsWith('/')) {
          return basePath + url.substring(1);
        }
        // 如果是相对路径（以./开头），去掉./前缀并添加基础路径
        if (url.startsWith('./')) {
          return basePath + url.substring(2);
        }
        // 默认添加基础路径
        return basePath + url;
      };

      const loadData = async () => {
        try {
          loading.value = true;
          const [papersResponse, introResponse] = await Promise.all([
            api.getPapersByCategory(category),
            api.getOverviewBySection(sectionKey)
          ]);
          
          papers.value = papersResponse.data || [];
          if (introResponse.data && introResponse.data.length > 0) {
            introSection.value = introResponse.data[0];
          }
        } catch (error) {
          console.error('加载数据失败:', error);
          ElementPlus.ElMessage.error('加载数据失败，请检查JSON文件');
        } finally {
          loading.value = false;
        }
      };

      onMounted(() => {
        loadData();
      });

      return {
        loading,
        papers,
        introSection,
        formatContent,
        formatDate,
        getImageUrl
      };
    },
    template: `
      <div class="paper-list-page">
        <h1 class="page-title">${title}</h1>
        <div v-if="introSection" class="intro-section content-box">
          <h2 class="section-title">{{ introSection.page_title || introSection.title }}</h2>
          <div v-if="introSection.image_url" class="image-container">
            <el-image :src="getImageUrl(introSection.image_url)" fit="contain" />
          </div>
          <div class="content-text" v-html="formatContent(introSection.content)"></div>
        </div>
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else>
          <div v-if="papers.length === 0" class="empty-state">
            <el-empty description="暂无论文数据" />
          </div>
          <div v-else class="papers-list">
            <div v-for="paper in papers" :key="paper.id" class="paper-detail-box content-box">
              <div class="paper-header">
                <h2 class="paper-title-large">{{ paper.title }}</h2>
                <div class="paper-meta">
                  <el-tag type="info" size="large">{{ paper.category_display }}</el-tag>
                  <span v-if="paper.authors" class="meta-item">
                    <strong>作者：</strong>{{ paper.authors }}
                  </span>
                  <span v-if="paper.journal" class="meta-item">
                    <strong>发表情况：</strong>{{ paper.journal }}
                  </span>
                  <span v-if="paper.doi" class="meta-item">
                    <strong>DOI：</strong>{{ paper.doi }}
                  </span>
                </div>
                <div v-if="paper.keywords" class="keywords">
                  <strong>关键词：</strong>
                  <el-tag v-for="keyword in paper.keywords.split(/[,，]/)" :key="keyword.trim()" size="small" class="keyword-tag">
                    {{ keyword.trim() }}
                  </el-tag>
                </div>
              </div>
              <div class="paper-body">
                <h3 class="section-title">简介</h3>
                <p class="abstract">{{ paper.abstract }}</p>
              </div>
              <div v-if="paper.introduction" class="paper-body">
                <h3 class="section-title">内容介绍</h3>
                <div class="introduction" v-html="formatContent(paper.introduction)"></div>
              </div>
              <div v-if="paper.images && paper.images.length > 0" class="paper-images">
                <h3 class="section-title">相关图片</h3>
                <div class="images-grid">
                  <div v-for="(image, index) in paper.images" :key="index" class="image-item">
                    <el-image
                      :src="getImageUrl(typeof image === 'string' ? image : image.image_url || image.url)"
                      fit="contain"
                      :preview-src-list="paper.images.map(img => getImageUrl(typeof img === 'string' ? img : img.image_url || img.url))"
                      class="paper-image"
                    />
                    <p v-if="typeof image === 'object' && image.caption" class="image-caption">{{ image.caption }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };
}

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/measurement',
    name: 'measurement',
    component: createPaperListPage('measurement', '测量', 'measurement_intro')
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: createPaperListPage('analysis', '分析', 'analysis_intro')
  },
  {
    path: '/intervention',
    name: 'intervention',
    component: createPaperListPage('intervention', '干预', 'intervention_intro')
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// App 组件
const App = {
  components: {
    NavBar,
    Footer
  },
  template: `
    <el-container>
      <el-header>
        <NavBar />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
      <el-footer>
        <Footer />
      </el-footer>
    </el-container>
  `
};

// 创建应用
const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
