疯狂 Builder 第 2 期：我把“X 链接转截图”做成了一个 Skill，写文章引用推文不用再手动截图

【图片 1：上传 x-doc/assets/fxbrief-cover.png】

很多时候，我们写科技新闻、产品观察、AI 简报，都会遇到一个很小但很烦的问题：

需要引用一条 X / Twitter 内容。

它可能是一条官方推文，也可能是一篇 X 长文，也可能只是某个产品团队发布的一段更新。

直接截图当然可以，但很快就会遇到一堆麻烦：

浏览器截图尺寸不统一；
手机端和桌面端 UI 不一致；
需要翻译正文，但又不想把名字、时间、数据也翻译掉；
X 长文很长，手动截图和切图都很麻烦；
截图里经常混入多余 UI、侧边栏、推荐内容；
想保留来源，但又不想看起来像伪造官方截图。

所以我做了第二个开源 Skill：

matt-fx-brief

它的目标很简单：

给一个 X 链接，自动生成可发布的本地素材。

直接上使用案例

比如，我想把 Google 这条推文生成截图，并且只把推文正文翻译成中文，其他 UI 保持原样。

【图片 2：上传 x-doc/assets/fxbrief-google-prompt.jpeg】

生成结果大概是这样：

【图片 3：上传 x-doc/assets/fxbrief-google-output.jpeg】

这件事情如果手动做，其实很容易变成一套重复劳动：

打开 X，找到推文，切换窗口，调尺寸，截图，裁边，翻译正文，检查排版，再保存。

而现在可以直接交给 Codex：

使用 $matt-fx-brief 把 https://x.com/Google/status/2054285931260334181 生成截图，要求截图正文是中文的。

它不是网页截图工具，而是本地素材渲染工具

FxBrief 的实现思路不是打开第三方网页然后截图。

它会做 4 件事：

1. 用 FxEmbed / FxTwitter 数据获取推文或 X 长文结构化信息
2. 本地用 React / HTML 模板重新渲染
3. 用 Playwright 在本机截图
4. 输出 PNG / WebP / Markdown / 本地图片资源

也就是说，它不是“截网页”，而是“把 X 内容变成一个本地可控的新闻素材”。

这点对我很重要。

因为我写内容时，需要的不是一张随机截屏，而是一张稳定、干净、能复用、能批量生成的素材。

目前最常用的 4 个模式

post-mobile
430px 移动端 X 风格截图，适合新闻引用源。

post-clean
媒体报道引用卡，保留来源信息，同时降低“官方截图”的观感。

article-md
X 长文导出 Markdown + assets + metadata。

article-shot
X 长文生成完整长截图，可切片。

post-mobile：适合新闻引用源

这个模式尽量贴近移动端 X 的视觉结构。比如头像、认证标、时间、数据、操作栏都会保留，适合文章里引用官方推文。

更关键的是，它支持“只翻译正文”。

名字、账号、时间、浏览量、按钮这些都不动，只有正文可以变成中文。这对于中文科技内容创作者很方便。

post-clean：降低“伪造官方截图”的观感

有些时候，我不想让素材看起来像一张官方 X 截图。

比如做媒体报道、公众号配图、知识卡片时，我更希望它像一个“来源引用卡”。

所以 post-clean 会保留来源和正文，但视觉上更像编辑素材，而不是官方界面。

这也能降低误导感。

article-md：X 长文导出 Markdown

X 长文适合直接转成 Markdown。

比如你自己写了一篇 X Article，后续想转到公众号、博客、Notion、飞书文档。如果重新复制排版，非常浪费时间。

article-md 会把 X 长文导出成：

article.md
metadata.json
raw.fxembed.json
assets/
  cover.jpg
  image-01.jpg

正文顺序、图片、封面、元数据都会保留下来。这样后续可以接入其他发布流程。

article-shot：X 长文长截图

如果你只是想把 X 长文分享到小红书、朋友圈、微信群、公众号素材库，Markdown 还不够，还需要长截图。

article-shot 可以生成完整长图，也可以切成多张图。

【图片 4：上传 x-doc/assets/fxbrief-article-slice-01.png】

命令行里可以这样用：

fxbrief article-shot "https://x.com/user/status/123" \
  --style article-x \
  --width 540 \
  --scale 2 \
  --slice-height 1800 \
  --out output/my-article

输出里会同时有完整长图和编号切片：

article-long.png
article-01.png
article-02.png
article-03.png

为什么我觉得它适合内容创作者

内容创作里，X 内容经常是信息源。

但是“把信息源变成素材”这一步，一直很碎：

写新闻，需要引用官方推文；
写产品分析，需要截产品团队的说明；
写长文，需要把自己的 X Article 同步到其他平台；
做小红书，需要把长文切成几张竖图；
做公众号，需要把一条英文推文转成中文引用图。

这些事情用 AI 生图解决不了。

因为它们的核心不是“生成一张新图”，而是忠实、干净、稳定地整理已有来源。

FxBrief 做的就是这件事。

安全、稳定、可控

我给这个工具设了几个原则：

第一，本地渲染。

不依赖第三方截图页面，不把最终素材交给一个不可控网页来渲染。

第二，保留来源。

默认带 source footer，能看到平台、账号和原始链接。新闻引用里，出处比样式更重要。

第三，模板可控。

样式不是浏览器里随缘截图，而是本地 HTML/CSS 模板。宽度、字体、边距、来源区、媒体展示方式都可以迭代。

第四，CLI + Skill 双入口。

你可以让 Codex 直接调用 Skill，也可以在命令行里批处理。

开源

Github:
https://github.com/mate-matt/matt-skills

CLI 已经发布到 npm：

npm install -g @mate-matt/fxbrief@latest
fxbrief --version

截图功能依赖 Playwright Chromium，如果本机没有，需要安装一次：

npx playwright install chromium

Codex 推荐安装 Skill：

$skill-installer install https://github.com/mate-matt/matt-skills/tree/main/skills/matt-fx-brief

安装后重启 Codex，让它发现新 Skill。

用 Codex 调用

使用 $matt-fx-brief 把 https://x.com/Google/status/2054285931260334181 生成截图，要求截图正文是中文的。

使用 $matt-fx-brief 将这篇 X 长文导出为 Markdown，并把图片资源保存到本地：https://x.com/user/status/123

使用 $matt-fx-brief 将这篇 X 长文生成完整长截图和至少 3 张切分图：https://x.com/user/status/123

Codex 会自动判断该用 post-mobile、post-clean、article-md 还是 article-shot。

如果你明确要求正文保留原文，它也不会自动翻译。

也可以直接命令行使用

fxbrief post-mobile "https://x.com/Google/status/2054285931260334181" \
  --lang zh-cn \
  --translated-text \
  --out output/google-android-chinese.png

fxbrief post-clean "https://x.com/user/status/123" \
  --media first \
  --hide-stats

fxbrief article-md "https://x.com/user/status/123"

fxbrief article-shot "https://x.com/user/status/123" \
  --style article-x \
  --slice-height 1800 \
  --out output/my-article

更多细节可以去 Github 文档里看。

疯狂 Builder 系列第二期

第一期我开源了 matt-pic-grab，解决的是“很多图不必文生图，可以安全地找图”。

第二期这个 matt-fx-brief，解决的是“很多 X 信息源不必手动截图，可以稳定地变成发布素材”。

这两个工具本质上都是一类东西：

不是为了炫技，而是把内容创作里那些重复、琐碎、但又必须做好的步骤，变成可以复用的 Skill。

后面我会继续开源更多这种小工具。

如果你也在用 Codex 做自己的工作流，欢迎来 Github 点 star，或者直接 fork 改成你自己的内容生产工具箱。

Github:
https://github.com/mate-matt/matt-skills
