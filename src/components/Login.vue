<template>
  <div class="login_container">
    <div class="login_box">
      <!-- logo，如果用户名存在，则替换为用户头像 -->
      <div class="avator-box">
        <img src="../assets/logo.png" alt="logo">
      </div>
      <!--  登录表单 注册表单的实例对象：ref="loginFormRef"   -->
      <el-form class="login_form" :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username" ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" show-password v-model="loginForm.password" ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单的验证规则
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置表单，并移除验证结果
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    // 登录按钮点击事件
    // 远程接口：https://www.liulongbin.top:8888/api/private/v1/
    login() {
      // valid：布尔值，校验结果
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        // 不加await返回的是promise对象。await只能使用在被async修饰的方法中
        // 结构赋值。将请求返回的对象的data属性取出来，并赋值给result
        const { data: result } = await this.$http.post('login', this.loginForm);
        if (result.meta.status !== 200) {
          return this.$message.error('登录失败');
        }
        this.$message.success('登录成功');
        window.sessionStorage.setItem('token', result.data.token);
        // 注意是$router，而不是$route
        await this.$router.push('/home');
      });
    }
  }
}
</script>

<!-- scoped：表示样式只在本组件有效 -->
<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }
  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 6px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avator-box {
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      background-color: #fff;
      /*margin: 0 auto;*/
      /*transform: translateY(-50%);*/
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 32px;
    /* 非常有用！！！ */
    box-sizing: border-box;
    .btns {
      /*float: right;*/
      display: flex;
      justify-content: flex-end;
    }
  }


</style>
