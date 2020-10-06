<template>
  <div>
    <el-card>
      <div slot="header">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 提示信息 -->
      <el-alert
        title="添加商品信息" type="warning" center show-icon>
      </el-alert>

      <!-- 步骤条 -->
      <el-steps :active="activeIndex - 0" process-status="finish" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单 -->
      <el-form label-position="top" label-width="100px" :model="addGoodsForm"
               :rules="addGoodsFormRules" ref="addGoodsFormRef">
        <!-- 左侧的Tab栏区域 -->
        <el-tabs v-model="activeIndex" tab-position="left"
                 :before-leave="beforeTabLeave" @tab-click="handleTabClicked">

          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"
                        minlength="3" maxlength="64" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"
                        onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"></el-input>
            </el-form-item>
            <el-form-item label="商品价重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"
                        onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"></el-input>
            </el-form-item>
            <el-form-item label="商品价数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"
                        onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"></el-input>
            </el-form-item>
            <!--
            v-model="value"     选中的值
            :options="options"  数据源
            :props="cateProps"  配置
            -->
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleCateChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <!-- 动态属性 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in dynamicParams" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <!-- 静态属性 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in staticProps" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <!--
           list-type="picture"  列表形式
           -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              drag
              accept="image/*"
              :action="uploadURL"
              :headers="headerObj"
              :on-success="handleUploadSucceed"
              :on-remove="handleImgRemove"
              :on-preview="handleImgPreview"
              list-type="picture">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button @click="addGoods" type="primary" class="add-btn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-card>

    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewURL" class="preview-img"/>
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: 'Add',
    data () {
      return {
        activeIndex: 0,
        // 表单的数据对象
        addGoodsForm: {
          goods_name: '',
          goods_price: 1,
          goods_weight: 1,
          goods_number: 1, // 商品数量
          // 商品所属分类的数组
          goods_cat: [],
          // selectedDynamicParams: []
          // 商品参数
          attrs: [],
          // 商品图片
          pics: [],
          // 商品详情的富文本信息
          goods_introduce: ''
        },
        // 表单的验证规则
        addGoodsFormRules: {
          goods_name: [
            {
              required: true,
              message: '请输入商品名称',
              trigger: 'blur'
            }
          ],
          goods_price: [
            {
              required: true,
              message: '请输入商品价格',
              trigger: 'blur'
            }
          ],
          goods_weight: [
            {
              required: true,
              message: '请输入商品重量',
              trigger: 'blur'
            }
          ],
          goods_number: [
            {
              required: true,
              message: '请输入商品数量',
              trigger: 'blur'
            }
          ],
          goods_cat: [
            {
              required: true,
              message: '请选择商品分类',
              trigger: 'blur'
            }
          ]
        },
        cateList: [], // 分类列表
        cateProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        // 动态参数
        dynamicParams: [],
        // 静态属性
        staticProps: [],
        // 图片上传的地址
        uploadURL: this.$http.defaults.baseURL + '/upload',
        // uploadURL: 'http://www.ysqorz.top:8888/api/private/v1/upload',
        // 图片上传组件的header请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 预览图片的url
        previewURL: '',
        previewVisible: false
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      // 获取分类列表
      async getCateList () {
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.cateList = res.data
        // console.log(this.cateList)
      },
      // 级联选择器选中时的回调
      handleCateChange () {
        //console.log(this.addGoodsForm.goods_cat);
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.addGoodsForm.goods_cat = []
        }
      },
      // 切换tab
      beforeTabLeave (activeName, oldActiveName) {
        if (oldActiveName === '0' &&
          this.addGoodsForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类')
          return false
        }
      },
      // tab点击时回调
      async handleTabClicked () {
        switch (this.activeIndex) {
          // 动态参数面板
          case '1': {
            const { data: res } = await this.$http.get(
              `categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }

            // attr_vals 转成数组
            res.data.forEach(item => {
              item.attr_vals = (item.attr_vals.length === 0 ? [] : item.attr_vals.split(','))
            })

            this.dynamicParams = res.data
            // console.log(this.addGoodsForm.selectedDynamicParams)
            break
          }
          // 静态属性面板
          case '2': {
            const { data: res } = await this.$http.get(
              `categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
            if (res.meta.status !== 200) {
              return this.$message.error(res.meta.msg)
            }
            // console.log(res.data);
            this.staticProps = res.data
            break
          }
        }
      },
      // 图片上传成功
      handleUploadSucceed (response) {
        const picInfo = { pic: response.data.tmp_path }
        this.addGoodsForm.pics.push(picInfo)
        console.log(this.addGoodsForm.pics)
      },
      // 移除图片的回调
      handleImgRemove (file) {
        const filePath = file.response.data.tmp_path
        const i = this.addGoodsForm.pics.findIndex(x => x.pic === filePath)
        this.addGoodsForm.pics.splice(i, 1) // 删除对应那一个元素
        console.log(this.addGoodsForm.pics)
      },
      // 上传图片的预览
      handleImgPreview (file) {
        this.previewURL = 'http://www.ysqorz.top:8888/' + file.response.data.tmp_path
        this.previewVisible = true
      },
      addGoods () {
        this.$refs.addGoodsFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项')
          }
          // 请求添加商品

          // 处理动态参数
          this.dynamicParams.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(',')
            }
            this.addGoodsForm.attrs.push(newInfo)
          })
          // 处理静态属性
          this.staticProps.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addGoodsForm.attrs.push(newInfo)
          })
          const form = _.cloneDeep(this.addGoodsForm)
          // 深拷贝一份，否则会报错。因为goods_cat绑定到了级联选择器，必须是数组
          form.goods_cat = form.goods_cat.join(',')
          // console.log(form)

          const { data: res } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg)
          }
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
      }
    },
    // 计算属性
    computed: {
      cateId () {
        if (this.addGoodsForm.goods_cat.length === 3) {
          return this.addGoodsForm.goods_cat[2]
        }
        return null
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    // 一定要加!important，否则不生效
    margin: 0 10px 0 0 !important;
  }

  .preview-img {
    width: 100%;
  }

  .add-btn {
    margin-top: 16px;
  }
</style>
