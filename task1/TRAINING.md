# 模型训练逻辑

## 快速开始

```bash
pip install -r requirements.txt
python train.py
```

可通过环境变量覆盖数据路径：

```bash
export TRAIN_DATA_PATH=/path/to/your/house_data.csv
python train.py
```

## 数据来源

默认读取 `../../House Price Dataset.csv`（仓库根目录），CSV 包含 8 列：

| 列 | 类型 | 说明 |
|---|---|---|
| `id` | int | 房屋 ID（训练时忽略） |
| `square_footage` | float | 房屋面积（平方英尺） |
| `bedrooms` | int | 卧室数量 |
| `bathrooms` | float | 浴室数量（可带 0.5） |
| `year_built` | int | 建造年份 |
| `lot_size` | float | 地块面积（平方英尺） |
| `distance_to_city_center` | float | 到市中心距离（英里） |
| `school_rating` | float | 学区评分（0-10） |
| `price` | float | **目标变量：房价（美元）** |

前 7 个为特征，`price` 为预测目标。

## 训练流程

### 1. 加载与切分

```python
df = pd.read_csv(DATA_PATH)
X = df[FEATURES]     # 7 列
y = df[TARGET]       # price

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

80% 训练 / 20% 测试，`random_state=42` 固定可复现。

### 2. 标准化

```python
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # 用训练集 fit
X_test_scaled = scaler.transform(X_test)        # 用同样的参数 transform 测试集
```

Z-score 标准化：`x_scaled = (x - μ) / σ`。每个特征减均值除标准差，消除量纲差异。

### 3. Ridge 回归

```python
model = Ridge(alpha=1.0, random_state=42)
model.fit(X_train_scaled, y_train)
```

**为什么选 Ridge 而不是普通 LinearRegression？**

房屋特征间高度相关（如面积大→房间多→浴室多），存在多重共线性。普通线性回归的系数会不稳定、方差大。

Ridge 在普通最小二乘基础上加了 L2 正则化惩罚项：

```
loss = Σ(y_true - y_pred)² + α × Σ(βᵢ)²
```

`α=1.0` 是正则化强度，惩罚过大的系数，让系数更稳定、更可解释。

### 4. 评估

```python
y_pred = model.predict(X_test_scaled)
metrics = {
    "r2_score": r2_score(y_test, y_pred),                        # 决定系数
    "mean_absolute_error": mean_absolute_error(y_test, y_pred),   # 平均绝对误差
    "root_mean_squared_error": sqrt(mean_squared_error(y_test, y_pred)),  # 均方根误差
}
```

三项指标全部保存到模型文件中。

### 5. 系数回转到原始尺度

**这是理解模型的关键步骤。** Ridge 在标准化数据上学到的系数不能直接解释为"每变动 1 个单位"——因为输入本身就是经过 Z-score 变换的。

```python
coefs = model.coef_ / scaler.scale_
intercept = model.intercept_ - np.dot(coefs, scaler.mean_)
```

**数学推导：**

标准化空间的公式：

```
y = I_s + Σ(C_sᵢ × (xᵢ - μᵢ) / σᵢ)
```

其中 `I_s` 是标准化空间截距，`C_sᵢ` 是标准化空间系数。

展开：

```
y = I_s + Σ(C_sᵢ × xᵢ / σᵢ) - Σ(C_sᵢ × μᵢ / σᵢ)
  = I_s + Σ(C_rawᵢ × xᵢ) - Σ(C_rawᵢ × μᵢ)
```

因此：

```
C_rawᵢ = C_sᵢ / σᵢ                     ← 原始尺度系数
I_raw  = I_s - Σ(C_rawᵢ × μᵢ)          ← 原始尺度截距
```

**最终公式（可直接用于解释）：**

```
房价 = I_raw + C_raw₁×面积 + C_raw₂×卧室 + C_raw₃×浴室
             + C_raw₄×年份 + C_raw₅×地块 + C_raw₆×距离 + C_raw₇×学区
```

### 6. 打包保存

```python
payload = {
    "model": model,             # Ridge 模型对象（含标准化空间系数）
    "scaler": scaler,           # StandardScaler（含 μ 和 σ）
    "features": FEATURES,       # 特征名列表（保持顺序）
    "coefficients": coefficients,  # 原始尺度系数（dict）
    "intercept": intercept,     # 原始尺度截距（float）
    "metrics": metrics,         # 评估指标（dict）
}

with open("app/model.pkl", "wb") as f:
    pickle.dump(payload, f)
```

保存到 `app/model.pkl`，推理时一次加载即可获得所有所需组件。

## 输出产物

| 文件 | 内容 |
|---|---|
| `app/model.pkl` | model、scaler、coefficients、intercept、metrics、features 全部打包 |

## 模型产物各字段说明

```python
payload = pickle.load(open("app/model.pkl", "rb"))

# payload["model"]        — sklearn Ridge 实例，可用于 predict()
# payload["scaler"]       — StandardScaler，含 mean_ 和 scale_（注意是 std，非方差）
# payload["features"]     — 特征名列表，推理时用于按正确顺序提取入参
# payload["coefficients"] — dict，原始尺度系数，可直接解读
# payload["intercept"]    — float，原始尺度截距
# payload["metrics"]      — dict，含 r2_score、mean_absolute_error、root_mean_squared_error
```

## 依赖

| 库 | 用途 |
|---|---|
| `pandas` | 读取 CSV 数据 |
| `numpy` | 数值计算 |
| `scikit-learn` | Ridge 回归、StandardScaler、train_test_split、评估指标 |
| `pickle` | 序列化模型产物（标准库） |
