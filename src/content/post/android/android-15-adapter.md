---
title: Android 15 适配
description: 'Android 15 适配'
publishDate: '2024/10/22'
tags: ['Android 15', 'Android', 'Java']
---

这里简单分享下我在适配 Android 15 的一些心得。

本篇文章不会介绍 Android 15 所有的更新。

## 更新应用的 build 配置

```groovy
// AGP >= 7.0.0
android {
    compileSdk 35
    ...
    defaultConfig {
        targetSdk 35
    }
}
```

对于较老的项目，这里建议将AGP升级到8.0.0以上，并且更新Java的版本到17以上。

由于一些老的项目还使用的是`ButterKnife`，这里建议用 [ViewBinding](https://developer.android.com/topic/libraries/view-binding?hl=zh-cn) 进行替换。

在更新完build配置后，程序大概率会报错，根据报错信息一一修改就好。

## Edge to Edge 适配

在 Android 15或更高版本的设备上，以 SDK 35 或更高版本为目标平台，系统会自动为该应用启用无边框模式。

该模式下，窗口的顶部以及底部都会以全屏的形式默认展开。

<div align="center">
    <video src="https://developer.android.com/static/images/guide/navigation/e2e-intro.mp4" width="400" controls="controls" type="video/mp4">
</div>

### 如何检查应用尚未实现无边框

如果您的应用还没有全面屏，那么您很可能会受到影响。在 除了针对已经采用无边框的应用的情况之外， 请考虑以下事项：

- 如果您的应用使用 Material 3 组件 ( androidx.compose.material3)，例如 TopAppBar， BottomAppBar 和 NavigationBar，那么这些组件可能不 会受到影响，因为它们会自动处理边衬区。
- 如果您的应用使用 Material 2 组件 ( androidx.compose.material），那么这些组件 不会自动处理边衬区。不过，您可以使用边衬区 并手动应用这些设置在 androidx.compose.material 1.6.0 中 然后使用 windowInsets 参数手动应用边衬区 BottomAppBar、TopAppBar、 BottomNavigation 和 NavigationRail。 同样，对以下内容使用 contentWindowInsets 形参： Scaffold。
- 如果您的应用使用视图和 Material 组件 (com.google.android.material)，大多数基于 View 的 Material 如 BottomNavigationView、BottomAppBar、 NavigationRailView 或 NavigationView，处理边衬区，不需要 额外工作。但是，您需要将 android:fitsSystemWindows="true" 如果使用 AppBarLayout，则会发生此错误。
- 对于自定义可组合项，请手动将边衬区作为内边距应用。如果您的 内容位于 Scaffold 内，因此您可以使用 Scaffold 来使用边衬区 内边距值。否则，使用 WindowInsets。
- 如果您的应用使用的是视图和 BottomSheet、SideSheet 或自定义 使用 ViewCompat.setOnApplyWindowInsetsListener。对于 RecyclerView，使用此监听器应用内边距，同时添加 clipToPadding="false"。

### 使用 Padding 适配

对每个界面顶部以及底部增加padding，使其不会被遮挡。

以下是我在项目中使用的代码（仅供参考）：

1. 新增 `ViewUtil` 在其中新增 `applyWindowInsets` 的方法。

   ```java
   class ViewUtil {
       /**
       * Set padding to this view.
       *
       * @param view  The View against which to invoke the method.
       * @param insetsType  Bit mask of WindowInsetsCompat.Types to query the insets for.
       */
       public static void applyWindowInsets(View view, int insetsType) {
           ViewCompat.setOnApplyWindowInsetsListener(view, (v, windowInsets) -> {
               Insets insets = windowInsets.getInsets(insetsType);
               v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
               // remove insets listener
               ViewCompat.setOnApplyWindowInsetsListener(view, null);
               return WindowInsetsCompat.CONSUMED;
           });
       }
   }
   ```

2. 创建 `IEdgeToEdge` 的 Interface，以供 Activity 和 Fragment 实现其中的方法。

   ```java
   public interface IEdgeToEdge {
       @Nullable
       @IdRes
       default Integer topLayoutResId() {
           return null;
       }

       @Nullable
       @IdRes
       default Integer bottomLayoutResId() {
           return null;
       }

       void adapterEdgeToEdge();
   }
   ```

3. 在 `BaseActivity` 或者 `BaseFragment` 中实现 `IEdgeToEdge` 的接口

   ```java
   public BaseActivity extends AppCompatActivity implements IEdgeToEdge {

       @Nullable
       @Override
       public Integer topLayoutResId() {
           return R.id.app_bar; // top layout default resId
       }

       @Nullable
       @Override
       public Integer bottomLayoutResId() {
           return R.id.bottom_layout; // bottom layout default resId
       }

       @Override
       public void adapterEdgeToEdge() {
           val topLayoutResId = topLayoutResId();
           if (topLayoutResId != null) {
               val topLayout = findViewById(topLayoutResId);
               if (topLayout != null) {
                   // Top layout insetsType is WindowInsetsCompat.Type.statusBars
                   ViewUtil.applyWindowInsets(topLayout, WindowInsetsCompat.Type.statusBars());
               }
           }

           val bottomLayoutResId = bottomLayoutResId();
           if (bottomLayoutResId != null) {
               val bottomLayout = findViewById(bottomLayoutResId);
               if (bottomLayout != null) {
                   // Top layout insetsType is WindowInsetsCompat.Type.navigationBars()
                   ViewUtil.applyWindowInsets(bottomLayout, WindowInsetsCompat.Type.navigationBars());
               }
           }
       }

       @Override
       public void onCreate(@Nullable Bundle savedInstanceState) {
           // Here is your init view codes
           ...

           // 如果是Fragment，请在 `onViewCreated` 中调用，确保 `findViewById` 可以找到对应的Id
           adapterEdgeToEdge();
       }
   }
   ```

   处理到这里，如果你的代码写的足够统一与规范，那么已经基本完成了适配。不过上述的代码并不适用于所有画面

4. 对特有的画面适配

   你需要在该画面中重写 `topLayoutResId()` 以及 `bottomLayoutResId()`，将你想调整的控件id填入其中即可。

   需要注意的是对于可滚动的控件，例如 RecycleView，建议是将 padding 设置为 RecycleView 本身，而不是他所在的 Layout，这样可以使 RecycleView 的可视化区域最大，

## 其他

1. 在 Android 15 中 DialogAlert 弹出后，Alert 会发生上下抖动

   原因：在 `dialog.setOnShowListener` 中做了某些操作，导致 Alert 的高度发生变化。

   解决方案：将 `dialog.setOnShowListener` 中的代码直接放在 `dialog.show()` 之后即可。

以上就是我在对应某项目的 Android 15 时遇到的全部问题。欢迎补充。
