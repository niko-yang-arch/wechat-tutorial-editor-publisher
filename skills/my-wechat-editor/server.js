const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use(express.static('public'));

// 确保目录存在
async function ensureDir(dirPath) {
    await fs.ensureDir(dirPath);
}

// 获取当前日期字符串
function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const dateStr = getCurrentDate();
            let uploadPath;
            
            // 根据图片类型决定存储位置
            if (file.fieldname === 'wechat') {
                uploadPath = path.join(__dirname, 'assets', dateStr, 'wechat');
            } else {
                uploadPath = path.join(__dirname, 'assets', dateStr);
            }
            
            await ensureDir(uploadPath);
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\u4e00-\u9fa5]/g, '_');
        
        if (file.fieldname === 'wechat') {
            cb(null, `wechat_${timestamp}_${safeName}`);
        } else {
            const stepIndex = req.body.stepIndex || '0';
            cb(null, `step${stepIndex}_${timestamp}_${safeName}`);
        }
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 限制10MB
});

// API: 上传步骤图片
app.post('/api/upload/steps', upload.array('images'), async (req, res) => {
    try {
        const files = req.files || [];
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const fileInfos = files.map(file => ({
            originalName: file.originalname,
            fileName: file.filename,
            path: file.path,
            size: file.size,
            url: `/assets/${getCurrentDate()}/${file.filename}`,
            fullUrl: `${baseUrl}/assets/${getCurrentDate()}/${file.filename}`
        }));
        
        res.json({
            success: true,
            message: `成功上传 ${files.length} 张图片`,
            files: fileInfos
        });
    } catch (error) {
        console.error('上传失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: 上传微信二维码
app.post('/api/upload/wechat', upload.single('wechat'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ success: false, message: '没有上传文件' });
        }
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        res.json({
            success: true,
            message: '微信二维码上传成功',
            file: {
                originalName: file.originalname,
                fileName: file.filename,
                path: file.path,
                size: file.size,
                url: `/assets/${getCurrentDate()}/wechat/${file.filename}`,
                fullUrl: `${baseUrl}/assets/${getCurrentDate()}/wechat/${file.filename}`
            }
        });
    } catch (error) {
        console.error('上传失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: 保存JSON数据
app.post('/api/save/json', async (req, res) => {
    try {
        const data = req.body;
        const dateStr = getCurrentDate();
        const jsonDir = path.join(__dirname, 'JSONS', dateStr);
        await ensureDir(jsonDir);
        
        // 生成文件名
        const nickname = data.user?.nickname || 'unknown';
        const timestamp = Date.now();
        const fileName = `user_${nickname}_${dateStr}_${timestamp}.json`;
        const filePath = path.join(jsonDir, fileName);
        
        // 添加服务器端信息
        data.serverInfo = {
            savedAt: new Date().toISOString(),
            filePath: `/JSONS/${dateStr}/${fileName}`,
            imageBaseUrl: `/assets/${dateStr}/`
        };
        
        // 写入文件
        await fs.writeJson(filePath, data, { spaces: 2 });
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        res.json({
            success: true,
            message: 'JSON数据保存成功',
            file: {
                name: fileName,
                path: filePath,
                url: `/JSONS/${dateStr}/${fileName}`,
                fullUrl: `${baseUrl}/JSONS/${dateStr}/${fileName}`
            }
        });
    } catch (error) {
        console.error('保存JSON失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: 批量保存所有数据（图片+JSON）
app.post('/api/save/all', upload.fields([
    { name: 'stepImages', maxCount: 100 },
    { name: 'wechatImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { body, files } = req;
        const stepImages = files['stepImages'] || [];
        const wechatImage = files['wechatImage'] ? files['wechatImage'][0] : null;
        const jsonData = JSON.parse(body.jsonData || '{}');
        
        const dateStr = getCurrentDate();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // 处理步骤图片
        const stepImageInfos = stepImages.map(file => ({
            stepIndex: file.fieldname,
            originalName: file.originalname,
            fileName: file.filename,
            path: file.path,
            size: file.size,
            url: `/assets/${dateStr}/${file.filename}`
        }));
        
        // 处理微信二维码
        let wechatInfo = null;
        if (wechatImage) {
            wechatInfo = {
                originalName: wechatImage.originalname,
                fileName: wechatImage.filename,
                path: wechatImage.path,
                size: wechatImage.size,
                url: `/assets/${dateStr}/wechat/${wechatImage.filename}`
            };
        }
        
        // 更新JSON中的图片路径
        if (stepImageInfos.length > 0) {
            stepImageInfos.forEach(imgInfo => {
                const stepIndex = parseInt(imgInfo.stepIndex);
                if (jsonData.steps && jsonData.steps[stepIndex]) {
                    if (!jsonData.steps[stepIndex].images) {
                        jsonData.steps[stepIndex].images = [];
                    }
                    jsonData.steps[stepIndex].images.push(imgInfo.url);
                }
            });
        }
        
        if (wechatInfo && jsonData.closing) {
            jsonData.closing.wechatQR = wechatInfo.url;
        }
        
        // 保存JSON
        const jsonDir = path.join(__dirname, 'JSONS', dateStr);
        await ensureDir(jsonDir);
        const jsonFileName = `user_${jsonData.user?.nickname || 'unknown'}_${dateStr}_${Date.now()}.json`;
        const jsonFilePath = path.join(jsonDir, jsonFileName);
        
        jsonData.serverInfo = {
            savedAt: new Date().toISOString(),
            filePath: `/JSONS/${dateStr}/${jsonFileName}`,
            imageBaseUrl: `/assets/${dateStr}/`,
            stepImages: stepImageInfos,
            wechatImage: wechatInfo
        };
        
        await fs.writeJson(jsonFilePath, jsonData, { spaces: 2 });
        
        res.json({
            success: true,
            message: '所有数据保存成功',
            data: {
                jsonFile: {
                    name: jsonFileName,
                    path: jsonFilePath,
                    url: `/JSONS/${dateStr}/${jsonFileName}`,
                    fullUrl: `${baseUrl}/JSONS/${dateStr}/${jsonFileName}`
                },
                stepImages: stepImageInfos,
                wechatImage: wechatInfo
            }
        });
        
    } catch (error) {
        console.error('批量保存失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API: 获取当天已保存的数据列表
app.get('/api/list/today', async (req, res) => {
    try {
        const dateStr = getCurrentDate();
        const jsonDir = path.join(__dirname, 'JSONS', dateStr);
        const assetsDir = path.join(__dirname, 'assets', dateStr);
        
        const jsonFiles = await fs.pathExists(jsonDir) ? await fs.readdir(jsonDir) : [];
        const imageFiles = await fs.pathExists(assetsDir) ? await fs.readdir(assetsDir) : [];
        const wechatDir = path.join(assetsDir, 'wechat');
        const wechatFiles = await fs.pathExists(wechatDir) ? await fs.readdir(wechatDir) : [];
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        res.json({
            success: true,
            date: dateStr,
            data: {
                jsonFiles: jsonFiles.map(f => ({
                    name: f,
                    url: `/JSONS/${dateStr}/${f}`,
                    fullUrl: `${baseUrl}/JSONS/${dateStr}/${f}`
                })),
                imageFiles: imageFiles.map(f => ({
                    name: f,
                    url: `/assets/${dateStr}/${f}`,
                    fullUrl: `${baseUrl}/assets/${dateStr}/${f}`
                })),
                wechatFiles: wechatFiles.map(f => ({
                    name: f,
                    url: `/assets/${dateStr}/wechat/${f}`,
                    fullUrl: `${baseUrl}/assets/${dateStr}/wechat/${f}`
                }))
            }
        });
    } catch (error) {
        console.error('获取列表失败:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📁 图片存储路径: ${path.join(__dirname, 'assets')}`);
    console.log(`📁 JSON存储路径: ${path.join(__dirname, 'JSONS')}`);
});